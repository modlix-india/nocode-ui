import React, { useEffect, useState } from 'react';
import { ComponentENUM } from '../../../../types/common';

/**
 * Preset picker that shows what each preset looks like.
 *
 * A dropdown reading "Aurora / Noise Waves / Gradient Mesh" tells an author
 * nothing about what they are choosing, which for a visual effect is most of
 * the decision. Each card renders a still of the real preset.
 *
 * The thumbnail renderer is behind a dynamic import so that opening any other
 * property panel does not pull three into the editor chunk. By the time this
 * editor is on screen a scene component is selected, so three is already
 * loading for the canvas anyway.
 */
export function ScenePresetEditor({
	value,
	defaultValue,
	options,
	onChange,
	hasStoredScene = false,
	onClearStoredScene,
}: Readonly<{
	value: string;
	defaultValue?: string;
	options: Array<ComponentENUM>;
	onChange: (v: string) => void;
	/** True once the component carries its own scene document. */
	hasStoredScene?: boolean;
	onClearStoredScene?: () => void;
}>) {
	const [thumbs, setThumbs] = useState<Record<string, string>>({});
	const selected = value || defaultValue || options[0]?.name;

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const { presetThumbnail } = await import(
				/* webpackChunkName: "ScenePresetThumbs" */ '../../../util/three/presetThumbnail'
			);
			for (const option of options) {
				// 'custom' has no preset behind it, so there is nothing to draw.
				if (option.name === 'custom') continue;
				const url = await presetThumbnail(option.name);
				if (cancelled) return;
				if (url) setThumbs(prev => ({ ...prev, [option.name]: url }));
			}
		})().catch(() => {
			/* A picker without pictures still works; it just lists names. */
		});
		return () => {
			cancelled = true;
		};
		// options is a stable module-level array on the property definition.
	}, [options]);

	return (
		<div className="_scenePresetEditor">
			{hasStoredScene ? (
				<div className="_scenePresetOverridden">
					This component has its own edited scene, which is what renders. Picking a preset
					here will DISCARD it and start again from that preset.
				</div>
			) : null}
			{options.map(option => {
				const isSelected = option.name === selected;
				const thumb = thumbs[option.name];
				return (
					<button
						type="button"
						key={option.name}
						className={`_scenePresetCard ${isSelected ? '_selected' : ''}`}
						title={option.description ?? option.displayName}
						aria-pressed={isSelected}
						onClick={() => {
							// The document wins at runtime, so picking a preset
							// while one is stored would appear to do nothing.
							// Clearing it is what the author meant.
							if (hasStoredScene) onClearStoredScene?.();
							onChange(option.name);
						}}
					>
						<span className="_scenePresetThumb">
							{thumb ? (
								<img src={thumb} alt="" />
							) : (
								<span className="_scenePresetPlaceholder" />
							)}
						</span>
						<span className="_scenePresetName">{option.displayName}</span>
					</button>
				);
			})}
		</div>
	);
}
