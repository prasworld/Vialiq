'use strict';

/**
 * Thin local wrapper around Nx's internal JS VersionActions implementation.
 *
 * This isolates the internal import path so the rest of our custom release
 * code can stay stable even if Nx moves the implementation between releases.
 */
const jsModule = require('@nx/js/src/release/version-actions');

exports.afterAllProjectsVersioned = jsModule.afterAllProjectsVersioned;
exports.JsVersionActions = jsModule.default;
