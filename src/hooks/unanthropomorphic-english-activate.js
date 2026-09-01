#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Claude Code caps hook stdout at 10,000 characters. Anything above that is
// written to a file and replaced by a preview, which defeats the hook.
const MAX_CHARS = 9500;

const FALLBACK_CONTEXT = `UNANTHROPOMORPHIC ENGLISH SKILL ACTIVE AUTOMATICALLY

Apply Unanthropomorphic English rules to all text. Use ASD-STE100 structure. Remove first-person language, self-reference, conversational filler, and human persona. Do not change code, identifiers, commands, or quoted errors.`;

const HEADER = [
  'UNANTHROPOMORPHIC ENGLISH SKILL ACTIVE AUTOMATICALLY',
  '',
  'Apply these rules without waiting for the user to name the skill. The full skill is at skills/unanthropomorphic-english/SKILL.md in this plugin. Read it for all tasks and replies.',
  '',
].join('\n');

function candidates(pluginRoot, hookDirectory, relative) {
  const roots = [];
  if (pluginRoot) {
    roots.push(pluginRoot);
  }
  roots.push(path.join(hookDirectory, '..', '..'), path.join(hookDirectory, '..'));
  return roots.map((root) => path.join(root, ...relative));
}

function promptCandidates(pluginRoot, hookDirectory) {
  return candidates(pluginRoot, hookDirectory, ['prompts', 'system-prompt.md']);
}

function readFirstFile(list) {
  for (const candidate of list) {
    try {
      return fs.readFileSync(candidate, 'utf8');
    } catch (error) {
      // Missing, unreadable, or a directory: try the next candidate.
    }
  }
  return '';
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function buildContext(promptText) {
  if (!promptText) {
    return FALLBACK_CONTEXT;
  }
  const out = HEADER + stripFrontmatter(promptText).trim();
  if (out.length > MAX_CHARS) {
    process.stderr.write(`unanthropomorphic-english hook: payload is ${out.length} characters, over the ${MAX_CHARS} cap; sending the fallback ruleset\n`);
    return FALLBACK_CONTEXT;
  }
  return out;
}

function main() {
  const pluginRoot = process.env.PLUGIN_ROOT || process.env.CLAUDE_PLUGIN_ROOT;
  process.stdout.write(buildContext(readFirstFile(promptCandidates(pluginRoot, __dirname))));
}

if (require.main === module) {
  main();
}

module.exports = {
  FALLBACK_CONTEXT,
  MAX_CHARS,
  buildContext,
  promptCandidates,
  readFirstFile,
  stripFrontmatter,
};
