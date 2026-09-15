// @ual/adapter-rest-json-v1 — the one adapterType all demo spokes use.
//
// A genuinely different backend (SOAP, a file drop, a message queue) would add a
// second adapterType implementing the same SpokeAdapter interface; the hub
// instantiates by type and knows nothing else about it.

export { RestJsonV1Adapter, ADAPTER_VERSION } from './adapter.js';
export type { RowIssueRecorder } from './adapter.js';
export {
  normalizeRow, normalizePriority, sanitize, truncate, humanize, ok, err,
} from './normalize.js';
export type { SpokeRowDto, NormalizeResult } from './normalize.js';
