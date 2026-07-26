#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SKILL_NAME = 'aws-serverless-skills';
const PKG_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGETS = ['codex', 'claude-code', 'claude-desktop'];

function usage() {
  console.error(`Usage: npx aws-serverless-skills [target ...]

Installs the ${SKILL_NAME} skill so it loads automatically. With no arguments, installs to: ${DEFAULT_TARGETS.join(', ')}.
Once loaded anywhere, use it in chat: /serverlessbp init and /serverlessbp audit (see SKILL.md).

Targets:
  codex                 \${CODEX_HOME:-~/.codex}/skills/${SKILL_NAME}
  claude-code           ~/.claude/skills/${SKILL_NAME}       (personal, every project)
  claude-code-project   ./.claude/skills/${SKILL_NAME}       (current directory's project)
  claude-desktop        builds ./dist/${SKILL_NAME}.zip in the current directory
                        (upload manually: Settings -> Capabilities -> Skills -> Upload)
`);
  process.exit(1);
}

function syncDir(dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(path.join(PKG_ROOT, 'SKILL.md'), path.join(dest, 'SKILL.md'));
  fs.cpSync(path.join(PKG_ROOT, 'references'), path.join(dest, 'references'), { recursive: true });
}

function installFsTarget(dest) {
  syncDir(dest);
  console.log(`Installed to ${dest}`);
}

function installDesktop() {
  const distDir = path.join(process.cwd(), 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  const zipPath = path.join(distDir, `${SKILL_NAME}.zip`);
  fs.rmSync(zipPath, { force: true });
  try {
    execFileSync('zip', ['-rq', zipPath, 'SKILL.md', 'references', '-x', '*.DS_Store'], {
      cwd: PKG_ROOT,
    });
  } catch (err) {
    console.error('Failed to build the zip — is the "zip" command available on this system?');
    throw err;
  }
  console.log(`Built ${zipPath}`);
  console.log('Upload manually: Settings -> Capabilities -> Skills -> Upload');
}

function installTarget(target) {
  switch (target) {
    case 'codex':
      installFsTarget(
        path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills', SKILL_NAME)
      );
      break;
    case 'claude-code':
      installFsTarget(path.join(os.homedir(), '.claude', 'skills', SKILL_NAME));
      break;
    case 'claude-code-project':
      installFsTarget(path.join(process.cwd(), '.claude', 'skills', SKILL_NAME));
      break;
    case 'claude-desktop':
      installDesktop();
      break;
    case '-h':
    case '--help':
      usage();
      break;
    default:
      console.error(`Unknown target: ${target}`);
      usage();
  }
}

const targets = process.argv.slice(2);
const list = targets.length ? targets : DEFAULT_TARGETS;
for (const t of list) installTarget(t);
