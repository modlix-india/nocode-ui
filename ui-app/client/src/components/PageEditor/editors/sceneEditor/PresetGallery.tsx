import React, { useEffect, useState } from 'react';
import { SCENE_PRESETS } from '../../../util/three/presets';
import type { SceneDocument } from '../../../util/three/sceneDocument';

/**
 * Starting points, as pictures.
 *
 * A gallery entry COPIES a document rather than setting a preset name. That is
 * the whole point of the editor existing: once a scene is edited it belongs to
 * the page, and a later change to presets.ts must not reach back and redesign a
 * hero that shipped months ago. During Phase 1 verification the aurora shader
 * was edited between two screenshots of the same unchanged page definition and
 * its appearance changed completely; on a live page that is a silent redesign
 * nobody connected to the deploy that caused it.
 */
export function PresetGallery({
	onPick,
	onClose,
}: Readonly<{
	onPick: (doc: SceneDocument) => void;
	onClose: () => void;
}>) {
	const [thumbs, setThumbs] = useState<Record<string, string>>({});

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const { presetThumbnail } = await import(
				/* webpackChunkName: "ScenePresetThumbs" */ '../../../util/three/presetThumbnail'
			);
			for (const preset of SCENE_PRESETS) {
				const url = await presetThumbnail(preset.name);
				if (cancelled) return;
				if (url) setThumbs(prev => ({ ...prev, [preset.name]: url }));
			}
		})().catch(() => {
			/* A gallery without pictures still works; it just lists names. */
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="_scenePresetGallery">
			<div className="_sceneInspectorTitle">
				Start from a preset
				<button type="button" className="_sceneToolBtn" onClick={onClose}>
					Close
				</button>
			</div>
			<p className="_sceneNote">
				This replaces the whole scene with a copy of the preset. From then on the page owns
				it, and later changes to the built-in preset will not touch it.
			</p>
			<div className="_scenePresetGalleryGrid">
				{SCENE_PRESETS.map(preset => (
					<button
						type="button"
						key={preset.name}
						className="_scenePresetCard"
						title={preset.description}
						onClick={() => onPick(preset.build())}
					>
						<span className="_scenePresetThumb">
							{thumbs[preset.name] ? (
								<img src={thumbs[preset.name]} alt="" />
							) : (
								<span className="_scenePresetPlaceholder" />
							)}
						</span>
						<span className="_scenePresetName">{preset.displayName}</span>
					</button>
				))}
			</div>
		</div>
	);
}
