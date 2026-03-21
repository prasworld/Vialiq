#!/usr/bin/env bash
set -euo pipefail

# Remove common Vitest residual folders/files from workspace.
paths=(
  ".vitest"
  "node_modules/.vitest"
)

for p in "${paths[@]}"; do
  if [[ -e "$p" ]]; then
    rm -rf "$p"
    echo "removed: $p"
  fi
done

# Remove nested .vitest directories that can appear in subprojects.
while IFS= read -r dir; do
  rm -rf "$dir"
  echo "removed: $dir"
done < <(find . -type d -name ".vitest" -not -path "./node_modules/*")

# Remove Vitest timestamp marker files.
while IFS= read -r file; do
  rm -f "$file"
  echo "removed: $file"
done < <(find . -type f -name "vitest.config.*.timestamp*" -not -path "./node_modules/*")

echo "vitest cleanup complete"
