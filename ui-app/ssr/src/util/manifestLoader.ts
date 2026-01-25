import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import logger from '../config/logger.js';

interface AssetManifest {
	files: Record<string, string>;
	entrypoints: Record<string, string[]>;
	preload: {
		application: string[];
		applicationStyle: string[];
	};
}

let cachedManifest: AssetManifest | null = null;

/**
 * Load the asset manifest from the filesystem
 * The manifest is downloaded from CDN during Docker build and baked into the image
 */
export function loadManifest(): AssetManifest | null {
	// Return cached manifest if already loaded
	if (cachedManifest) {
		return cachedManifest;
	}

	const manifestPath = join(process.cwd(), 'manifests', 'asset-manifest.json');

	try {
		logger.info('Loading asset manifest from filesystem', { path: manifestPath });

		const manifestContent = readFileSync(manifestPath, 'utf-8');
		const manifest = JSON.parse(manifestContent) as AssetManifest;

		// Validate manifest structure
		if (!manifest.preload || !manifest.preload.application || !manifest.preload.applicationStyle) {
			logger.warn('Invalid manifest structure', { manifest });
			return null;
		}

		cachedManifest = manifest;

		logger.info('Asset manifest loaded successfully', {
			applicationChunks: manifest.preload.application.length,
			styleChunks: manifest.preload.applicationStyle.length,
		});

		return manifest;
	} catch (error) {
		logger.error('Error loading asset manifest', {
			error: error instanceof Error ? error.message : String(error),
			path: manifestPath
		});
		return null;
	}
}

/**
 * Get the top N largest chunks for preloading
 * We don't want to preload ALL chunks, just the critical ones
 */
export function getCriticalChunks(manifest: AssetManifest | null, limit: number = 3): {
	application: string[];
	applicationStyle: string[];
} {
	if (!manifest) {
		return { application: [], applicationStyle: [] };
	}

	// For now, just return the first N chunks
	// In the future, we could sort by size or use heuristics
	return {
		application: manifest.preload.application.slice(0, limit),
		applicationStyle: manifest.preload.applicationStyle.slice(0, limit),
	};
}

/**
 * Clear the cached manifest (useful for testing or manual cache invalidation)
 */
export function clearManifestCache(): void {
	cachedManifest = null;
	logger.info('Asset manifest cache cleared');
}
