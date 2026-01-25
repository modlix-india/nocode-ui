#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate a short unique build ID based on timestamp
const buildId = Date.now().toString(36);
const buildTime = new Date().toISOString();

const content = `// Auto-generated file - DO NOT EDIT
// Generated at: ${buildTime}
export const BUILD_ID = '${buildId}';
`;

const outputPath = join(__dirname, '..', 'src', 'config', 'buildInfo.ts');
writeFileSync(outputPath, content, 'utf-8');

console.log(`Generated build info: BUILD_ID = ${buildId}`);
