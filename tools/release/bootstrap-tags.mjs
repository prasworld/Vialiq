#!/usr/bin/env node

import { appendFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const nx = JSON.parse(readFileSync('nx.json', 'utf8'));
const projects = nx?.release?.projects;

if (!Array.isArray(projects) || projects.length === 0) {
  console.error('release.projects is missing or empty in nx.json');
  process.exit(1);
}

const createdTags = [];

for (const lib of projects) {
  const publishPkgPath = `libs/${lib}/publish-package.json`;
  const pkg = JSON.parse(readFileSync(publishPkgPath, 'utf8'));
  const tag = `${lib}@${pkg.version}`;

  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`], {
      stdio: 'ignore',
    });
    console.log(`Tag already exists: ${tag}`);
  } catch {
    const message = `chore: initial release tag for ${tag}`;
    execFileSync('git', ['tag', '-a', tag, '-m', message], { stdio: 'ignore' });
    createdTags.push(tag);
    console.log(`Created tag: ${tag}`);
  }
}

console.log(`Bootstrap complete. Created ${createdTags.length} tag(s).`);

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  const csv = createdTags.join(',');
  appendFileSync(githubOutput, `created_count=${createdTags.length}\n`);
  appendFileSync(githubOutput, `created_tags=${csv}\n`);
}
