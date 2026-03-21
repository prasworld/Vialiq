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

# Remove nested .vitest directories that can appear in subprojects,
# skipping all node_modules subtrees for safety and performance.
while IFS= read -r dir; do
  rm -rf "$dir"
  echo "removed: $dir"
done < <(find . -type d -name node_modules -prune -o -type d -name ".vitest" -print)

# Remove Vitest timestamp marker files, also skipping all node_modules subtrees.
while IFS= read -r file; do
  rm -f "$file"
  echo "removed: $file"
done < <(find . -type d -name node_modules -prune -o -type f -name "vitest.config.*.timestamp*" -print)

echo "vitest cleanup complete"
