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

const { joinPathFragments } = require('@nx/devkit');
const { JsVersionActions, afterAllProjectsVersioned } = require('./version-actions-base');

/** Re-export so Nx still runs the lock-file update hook after versioning. */
exports.afterAllProjectsVersioned = afterAllProjectsVersioned;

class MonorepoVersionActions extends JsVersionActions {
  async init(tree) {
    if (!this.projectGraphNode?.data?.root || typeof this.projectGraphNode.data.root !== 'string') {
      throw new Error(
        `Unable to initialize VersionActions for project "${this.projectGraphNode?.name ?? '<unknown>'}" because projectGraphNode.data.root is missing or invalid.`
      );
    }
    // Base JsVersionActions.init: when manifestRootsToUpdate is empty (the
    // default after removing the stale file-path entries from project.json),
    // Nx falls back to {projectRoot} and adds {projectRoot}/package.json to
    // this.manifestsToUpdate.
    await super.init(tree);

    // Also track publish-package.json so nx release version bumps it in the
    // same commit.  Without this, publish-changed.mjs would read the old
    // version from publish-package.json and either skip or mispublish.
    const projectRoot = this.projectGraphNode.data.root;
    const publishManifestPath = joinPathFragments(projectRoot, 'publish-package.json');
    if (tree.exists(publishManifestPath)) {
      const packageJsonManifest = this.manifestsToUpdate.find(
        (manifest) => manifest.manifestPath?.endsWith('package.json')
      );
      const preserveLocalDependencyProtocols =
        packageJsonManifest?.preserveLocalDependencyProtocols ??
        this.manifestsToUpdate[0]?.preserveLocalDependencyProtocols;

      this.manifestsToUpdate.push({
        path: projectRoot,
        preserveLocalDependencyProtocols,
        manifestPath: publishManifestPath,
      });
    }
  }
}

exports.default = MonorepoVersionActions;
