# Unanthropomorphic English hooks

The Claude Code and Codex plugins include a `SessionStart` hook. The hook loads Unanthropomorphic English when a session starts.

The hook needs Node.js. Both plugins run `src/hooks/unanthropomorphic-english-activate.js` with the `node` command.

## Install

Claude Code:

```bash
claude plugin marketplace add davidsgbang/UnanthromorphicEnglish
claude plugin install unanthropomorphic-english@unanthropomorphic-english
```

Codex:

```bash
codex plugin marketplace add davidsgbang/UnanthromorphicEnglish
codex plugin add unanthropomorphic-english@unanthropomorphic-english
```

Codex asks you to review and trust the hook before its first run. Open `/hooks` to approve it.

## What the hook sends

The hook writes `prompts/system-prompt.md` to standard output. The condensed rules fit under the hook limit. The hook names the full skill path for compliance checks.

Codex applies its own cap to hook context. The `additionalContextLimit: 0` setting in `hooks/hooks.json` turns off the spill-to-disk threshold. It does not remove the cap. The condensed rules fit under it.

If the hook cannot read the prompt file, it tries the next location. If every location fails, it prints a short fallback rule set and exits 0. The session still starts.

## Where each harness loads the hook

- Claude Code: the `hooks` field in `.claude-plugin/plugin.json`.
- Codex: `hooks/hooks.json`, named by the `hooks` field in `.codex-plugin/plugin.json`. The marketplace catalog is `.agents/plugins/marketplace.json`.

## Test

From the repository root:

```bash
node --test src/hooks/unanthropomorphic-english-activate.test.js
```

## Advisory writing checks (Claude Code)

Two more hooks run under Claude Code, both advisory. Neither one blocks.

- `PostToolUse` on `Write` and `Edit`: when the file is Markdown, `src/hooks/lint_hook.py` lints it with `evals/ste_lint.py` and shows a one-line summary of the violations to the model.
- `Stop`: the same script reads the last reply and adds a system message when the reply breaks the register: more than five sentences outside code and lists, a filler opener or closer, or a slop word.

Codex runs only the `SessionStart` hook. Test the checks with `python3 src/hooks/test_lint_hook.py`.
