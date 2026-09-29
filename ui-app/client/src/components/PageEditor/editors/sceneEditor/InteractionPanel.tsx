import React from 'react';
import type { SceneDocument } from '../../../util/three/sceneDocument';

/**
 * Binds a gesture on an object to a page event function.
 *
 * A pick runs an ordinary page event through runEvent, exactly as a Button
 * click does, so nothing here is a special kind of event: the same functions
 * the rest of the page uses show up in this list.
 */
export function InteractionPanel({
	doc,
	eventKeys,
	onAdd,
	onUpdate,
	onRemove,
}: Readonly<{
	doc: SceneDocument;
	eventKeys: string[];
	onAdd: () => void;
	onUpdate: (i: number, patch: any) => void;
	onRemove: (i: number) => void;
}>) {
	return (
		<div className="_sceneInteractions">
			<div className="_sceneInspectorTitle">
				Interactions
				<button type="button" className="_sceneToolBtn" onClick={onAdd}>
					+ Add
				</button>
			</div>

			{!eventKeys.length ? (
				<p className="_sceneNote">
					This page has no event functions yet, so there is nothing to bind a gesture to.
					Add one in the page editor first.
				</p>
			) : null}

			{doc.interactions.map((it, i) => (
				// Index key: an interaction has no id, and two rows can be
				// identical while one is being filled in.
				// eslint-disable-next-line react/no-array-index-key
				<div className="_sceneInteractionRow" key={i}>
					<label className="_sceneField">
						<span>On</span>
						<select value={it.on} onChange={e => onUpdate(i, { on: e.target.value })}>
							<option value="click">click</option>
							<option value="hover">hover</option>
							<option value="pointerdown">pointer down</option>
							<option value="pointerup">pointer up</option>
						</select>
					</label>

					<label className="_sceneField">
						<span>Of</span>
						<select
							value={it.targetId}
							onChange={e => onUpdate(i, { targetId: e.target.value })}
						>
							{/* Empty means anywhere on the canvas, which is how a
							    background shader gets a click handler with no
							    objects to hit. */}
							<option value="">anywhere on the scene</option>
							{doc.objects.map(o => (
								<option key={o.id} value={o.id}>
									{o.name || o.id}
								</option>
							))}
						</select>
					</label>

					<label className="_sceneField">
						<span>Run</span>
						<select
							value={it.event}
							onChange={e => onUpdate(i, { event: e.target.value })}
						>
							<option value="">— nothing —</option>
							{eventKeys.map(k => (
								<option key={k} value={k}>
									{k}
								</option>
							))}
						</select>
					</label>

					<button
						type="button"
						className="_sceneToolBtn _danger"
						onClick={() => onRemove(i)}
					>
						Remove
					</button>

					{!it.event ? (
						<div className="_sceneTrackOrphan">
							With no function chosen this interaction does nothing.
						</div>
					) : null}
				</div>
			))}

			{!doc.interactions.length ? (
				<p className="_sceneNote">No interactions. The scene is decorative.</p>
			) : null}
		</div>
	);
}
