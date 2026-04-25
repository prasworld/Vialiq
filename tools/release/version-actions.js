'use strict';
/**
 * Custom VersionActions for this monorepo.
 *
 * Problem solved: in Nx 22 the `manifestRootsToUpdate` config expects
 * *directory* roots (e.g. "libs/flux-ui"), not file paths.  The old pattern
 * of listing "libs/flux-ui/package.json" as a root causes Nx to construct the
 * path "libs/flux-ui/package.json/package.json" — which never exists — and
 * emit the confusing "libs/flux-ui//package.json" error message.
 *
 * This class extends @nx/js JsVersionActions to handle both manifests that
 * each publishable lib maintains:
 *
 *  • package.json          – required by Nx internals (git-tag resolver, etc.)
 *  • publish-package.json  – copied to dist/ by postbuild-publish and read by
 *                            publish-changed.mjs to determine the npm version
 *
 * With this class in place, manifestRootsToUpdate no longer needs to be set
 * in individual project.json files; Nx defaults to {projectRoot} for
 * package.json, and this override appends publish-package.json.
 */

const { join } = require('node:path');
const jsModule = require('@nx/js/src/release/version-actions');

/** Re-export so Nx still runs the lock-file update hook after versioning. */
exports.afterAllProjectsVersioned = jsModule.afterAllProjectsVersioned;

class MonorepoVersionActions extends jsModule.default {
  async init(tree) {
    // Base JsVersionActions.init: when manifestRootsToUpdate is empty (the
    // default after removing the stale file-path entries from project.json),
    // Nx falls back to {projectRoot} and adds {projectRoot}/package.json to
    // this.manifestsToUpdate.
    await super.init(tree);

    // Also track publish-package.json so nx release version bumps it in the
    // same commit.  Without this, publish-changed.mjs would read the old
    // version from publish-package.json and either skip or mispublish.
    const publishManifestPath = join(
      this.projectGraphNode.data.root,
      'publish-package.json'
    );
    if (tree.exists(publishManifestPath)) {
      this.manifestsToUpdate.push({
        path: this.projectGraphNode.data.root,
        preserveLocalDependencyProtocols: false,
        manifestPath: publishManifestPath,
      });
    }
  }
}

exports.default = MonorepoVersionActions;
