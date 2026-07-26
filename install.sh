#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="aws-serverless-skills"
SRC="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_TARGETS=(codex claude-code claude-desktop)

usage() {
  cat >&2 <<EOF
Usage: $0 [target ...]

Installs this skill so it loads automatically. With no arguments, installs to: ${DEFAULT_TARGETS[*]}.
Once loaded anywhere, use it in chat: /serverlessbp init and /serverlessbp audit (see SKILL.md).

Targets:
  codex                 \${CODEX_HOME:-\$HOME/.codex}/skills/$SKILL_NAME
  claude-code           \$HOME/.claude/skills/$SKILL_NAME   (personal, every project)
  claude-code-project   ./.claude/skills/$SKILL_NAME        (current project only; run from that project's directory)
  claude-desktop        builds ./dist/$SKILL_NAME.zip — upload manually via Settings -> Capabilities -> Skills
EOF
  exit 1
}

sync_dir() {
  local dest="$1"
  mkdir -p "$dest"
  rsync -a --delete \
    --exclude .git --exclude .DS_Store --exclude dist \
    --exclude install.sh --exclude README.md \
    "$SRC/" "$dest/"
}

install_target() {
  case "$1" in
    codex)
      local dest="${CODEX_HOME:-$HOME/.codex}/skills/$SKILL_NAME"
      sync_dir "$dest"
      echo "Installed to $dest"
      ;;
    claude-code)
      local dest="$HOME/.claude/skills/$SKILL_NAME"
      sync_dir "$dest"
      echo "Installed to $dest"
      ;;
    claude-code-project)
      local dest
      dest="$(pwd)/.claude/skills/$SKILL_NAME"
      sync_dir "$dest"
      echo "Installed to $dest"
      ;;
    claude-desktop)
      mkdir -p "$SRC/dist"
      local zip="$SRC/dist/$SKILL_NAME.zip"
      rm -f "$zip"
      (cd "$SRC" && zip -rq "$zip" SKILL.md references -x '*.DS_Store')
      echo "Built $zip"
      echo "Upload manually: Settings -> Capabilities -> Skills -> Upload"
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown target: $1" >&2
      usage
      ;;
  esac
}

TARGETS=("$@")
if [[ ${#TARGETS[@]} -eq 0 ]]; then
  TARGETS=("${DEFAULT_TARGETS[@]}")
fi

for t in "${TARGETS[@]}"; do
  install_target "$t"
done
