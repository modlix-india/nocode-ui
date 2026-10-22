// Only the KIRun function classes: functions/all.ts re-exports this file and every export there
// is instantiated as a function. Adapters, the registry and the session are imported directly.
export { Answer, Connect, Disconnect, Hangup, Mute } from './CallFunctions';
