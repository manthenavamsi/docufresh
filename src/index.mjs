/**
 * DocuFresh - ES Module Entry Point
 * Wraps the CommonJS module for ESM imports
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const cjs = require('./index.js');

export default cjs;
export const DocuFresh = cjs.DocuFresh;
