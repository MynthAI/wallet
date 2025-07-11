#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

latest_version=$(curl -fsSL https://api.github.com/repos/nvm-sh/nvm/releases/latest \
  | grep -Po '"tag_name": "\K.*?(?=")')

if [[ -z "$latest_version" ]]; then
  echo "Error: Could not fetch latest nvm version" >&2
  exit 1
fi

curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${latest_version}/install.sh" | bash

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
nvm alias default 22
npm install -g corepack@latest
corepack enable
corepack prepare pnpm@latest --activate

export PNPM_HOME="$HOME/.local/share/pnpm"
mkdir -p "$PNPM_HOME"
pnpm config set global-bin-dir "$PNPM_HOME"

pnpm install
