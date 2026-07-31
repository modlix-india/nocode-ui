// jsdom does not expose TextEncoder/TextDecoder as globals, but react-router v7
// touches TextEncoder at module load time. Provide them from Node's util so any
// suite that transitively imports react-router-dom can load under jsdom.
const { TextEncoder, TextDecoder } = require('node:util');

if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder;
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;
