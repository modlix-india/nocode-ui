import React, { useState } from 'react';
import { EASING_NAMES, type EasingName } from '../../../util/three/easing';
import type { SceneDocument, TimelineTrack } from '../../../util/three/sceneDocument';
import { trackTargets } from '../../../util/three/sceneEdits';

/**
 * Tracks, keys and the scrub position.
 *
 * Targets come from a list rather than a text box because `parseTrackTarget`
 * accepts only three roots, and a mistyped target is dropped in silence: the
 * track stays in the document, appears here, and animates nothing.
 */
export function TimelinePanel({
	doc,
	progress,
	playing,
	onScrub,
	onTogglePlay,
	onAddTrack,
	onRemoveTrack,
	onUpdateTrack,
	onSetKey,
	onAddKey,
	onRemoveKey,
	onSetDriver,
}: Readonly<{
	doc: SceneDocument;
	progress: number;
	playing: boolean;
	onScrub: (p: number) => void;
	onTogglePlay: () => void;
	onAddTrack: (target: string) => void;
	onRemoveTrack: (i: number) => void;
	onUpdateTrack: (i: number, patch: Partial<TimelineTrack>) => void;
	onSetKey: (t: number, k: number, patch: { t?: number; v?: number }) => void;
	onAddKey: (t: number) => void;
	onRemoveKey: (t: number, k: number) => void;
	onSetDriver: (d: string) => void;
}>) {
	const targets = trackTargets(doc);
	const [pending, setPending] = useState('');

	return (
		<div className="_sceneTimeline">
			<div className="_sceneTimelineBar">
				<label className="_sceneField">
					<span>Driven by</span>
					<select value={doc.timeline.driver} onChange={e => onSetDriver(e.target.value)}>
						<option value="time">A clock</option>
						<option value="scroll">Scroll position</option>
						<option value="pointer">The pointer</option>
					</select>
				</label>

				<button type="button" className="_sceneToolBtn" onClick={onTogglePlay}>
					{playing ? '❚❚ Pause' : '▶ Play'}
				</button>

				<input
					className="_sceneScrub"
					type="range"
					min={0}
					max={1}
					step={0.001}
					value={progress}
					onChange={e => onScrub(Number(e.target.value))}
					aria-label="Timeline position"
				/>
				<span className="_sceneScrubValue">{progress.toFixed(3)}</span>

				<select
					value={pending}
					onChange={e => {
						setPending('');
						if (e.target.value) onAddTrack(e.target.value);
					}}
				>
					<option value="">+ Track…</option>
					{targets.map(t => (
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
			</div>

			{doc.timeline.driver === 'scroll' ? (
				<p className="_sceneNote">
					There is nothing to scroll in here, so the slider above stands in for the page
					scroll. On the page it will be driven by the visitor.
				</p>
			) : null}

			{doc.timeline.tracks.map((track, ti) => (
				<div className="_sceneTrack" key={track.target}>
					<div className="_sceneTrackHead">
						<span className="_sceneTrackTarget" title={track.target}>
							{targets.find(t => t.value === track.target)?.label ?? track.target}
						</span>
						<select
							value={track.ease}
							onChange={e =>
								onUpdateTrack(ti, { ease: e.target.value as EasingName })
							}
						>
							{EASING_NAMES.map(name => (
								<option key={name} value={name}>
									{name}
								</option>
							))}
						</select>
						<button
							type="button"
							className="_sceneToolBtn"
							onClick={() => onAddKey(ti)}
							title="Add a key at the current scrub position"
						>
							+ Key
						</button>
						<button
							type="button"
							className="_sceneToolBtn _danger"
							onClick={() => onRemoveTrack(ti)}
						>
							Remove
						</button>
					</div>

					{!targets.some(t => t.value === track.target) ? (
						<div className="_sceneTrackOrphan">
							Nothing in this scene answers to “{track.target}”, so this track
							animates nothing. It usually means the object was renamed or deleted
							outside the editor.
						</div>
					) : null}

					<div className="_sceneKeys">
						{track.keys.map((k, ki) => (
							// Index key: two keys can legitimately share a t while
							// one is being dragged past the other, so t is not a
							// stable identity here.
							// eslint-disable-next-line react/no-array-index-key
							<div className="_sceneKey" key={ki}>
								<label>
									<span>at</span>
									<input
										type="number"
										step={0.05}
										min={0}
										max={1}
										value={k.t}
										onChange={e => {
											const n = Number(e.target.value);
											if (Number.isFinite(n)) onSetKey(ti, ki, { t: n });
										}}
									/>
								</label>
								<label>
									<span>=</span>
									<input
										type="number"
										step={0.1}
										value={k.v}
										onChange={e => {
											const n = Number(e.target.value);
											if (Number.isFinite(n)) onSetKey(ti, ki, { v: n });
										}}
									/>
								</label>
								<button
									type="button"
									className="_sceneKeyDel"
									title={
										track.keys.length <= 2
											? 'A track needs at least two keys to interpolate'
											: 'Remove this key'
									}
									disabled={track.keys.length <= 2}
									onClick={() => onRemoveKey(ti, ki)}
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>
			))}

			{!doc.timeline.tracks.length ? (
				<p className="_sceneNote">
					No tracks, so nothing animates. Add one from the list above.
				</p>
			) : null}
		</div>
	);
}
