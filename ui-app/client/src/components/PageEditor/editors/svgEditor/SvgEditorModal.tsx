import React, { useMemo, useState } from 'react';
import Portal from '../../../Portal';
import { AddShapeToolbar } from './AddShapeToolbar';
import { AttributeInspector } from './AttributeInspector';
import { ShapeKind, SvgEditorModalProps } from './common';
import { ElementTree } from './ElementTree';
import { SvgCanvas } from './SvgCanvas';
import { SvgEditorStyle } from './SvgEditorStyle';
import {
	addCssAnim,
	addShape,
	addSmil,
	buildTree,
	deleteElement,
	ensureEditIds,
	finalize,
	getElementDetails,
	removeAttr,
	removeSmil,
	renameAttr,
	setAttr,
	setStyleProp,
	setText,
} from './svgDocument';
import { movePoint, parsePath, PathPoint, serializePath } from './svgPath';

export function SvgEditorModal({ initialMarkup, onSave, onClose }: Readonly<SvgEditorModalProps>) {
	const [history, setHistory] = useState<string[]>(() => [ensureEditIds(initialMarkup)]);
	const [index, setIndex] = useState(0);
	const [selectedId, setSelectedId] = useState('');
	// Transient markup during a path-handle drag — rendered live but not pushed
	// to history until the drag ends (one undo entry per drag).
	const [dragMarkup, setDragMarkup] = useState<string | null>(null);

	const markup = history[index];
	const view = dragMarkup ?? markup;
	const tree = useMemo(() => buildTree(view), [view]);
	const details = useMemo(
		() => (selectedId ? getElementDetails(view, selectedId) : null),
		[view, selectedId],
	);

	const commit = (next: string) => {
		if (next === markup) return;
		const newHistory = [...history.slice(0, index + 1), next];
		setHistory(newHistory);
		setIndex(newHistory.length - 1);
	};

	const onAddShape = (kind: ShapeKind) => {
		const { markup: next, newEditId } = addShape(markup, selectedId || undefined, kind);
		commit(next);
		if (newEditId) setSelectedId(newEditId);
	};

	const onDelete = () => {
		if (!selectedId) return;
		commit(deleteElement(markup, selectedId));
		setSelectedId('');
	};

	const onMovePathPoint = (pt: PathPoint, x: number, y: number, phase: 'move' | 'end') => {
		const base = dragMarkup ?? markup;
		const curD =
			getElementDetails(base, selectedId)?.attrs.find(a => a.name === 'd')?.value ?? '';
		const next = setAttr(
			base,
			selectedId,
			'd',
			serializePath(movePoint(parsePath(curD), pt, x, y)),
		);
		if (phase === 'end') {
			setDragMarkup(null);
			commit(next);
		} else {
			setDragMarkup(next);
		}
	};

	const pathD =
		details?.tag === 'path'
			? (details.attrs.find(a => a.name === 'd')?.value ?? '')
			: undefined;

	return (
		<Portal>
			<SvgEditorStyle />
			<div className="_svgEditorBackdrop" onClick={onClose} role="presentation">
				<div
					className="_svgEditorModal"
					onClick={e => e.stopPropagation()}
					role="presentation"
				>
					<div className="_svgEditorToolbar">
						<AddShapeToolbar onAdd={onAddShape} />
						<button
							type="button"
							className="_toolBtn"
							title="Undo"
							disabled={index === 0}
							onClick={() => setIndex(i => Math.max(0, i - 1))}
						>
							<i className="fa fa-solid fa-rotate-left" />
						</button>
						<button
							type="button"
							className="_toolBtn"
							title="Redo"
							disabled={index >= history.length - 1}
							onClick={() => setIndex(i => Math.min(history.length - 1, i + 1))}
						>
							<i className="fa fa-solid fa-rotate-right" />
						</button>
						<span className="_spacer" />
						<button type="button" className="_toolBtn" title="Close" onClick={onClose}>
							<i className="fa fa-solid fa-xmark" />
						</button>
						<button
							type="button"
							className="_svgSaveButton"
							onClick={() => {
								onSave(finalize(view));
								onClose();
							}}
						>
							Save
						</button>
					</div>

					<div className="_svgEditorBody">
						<div className="_svgEditorTreePane">
							<ElementTree
								tree={tree}
								selectedId={selectedId}
								onSelect={setSelectedId}
							/>
						</div>

						<SvgCanvas
							markup={view}
							selectedId={selectedId}
							onSelect={setSelectedId}
							pathEditId={details?.tag === 'path' ? selectedId : undefined}
							pathD={pathD}
							onMovePathPoint={onMovePathPoint}
						/>

						<div className="_svgEditorSidePane">
							<AttributeInspector
								details={details}
								onSetStyle={(prop, value) =>
									commit(setStyleProp(markup, selectedId, prop, value))
								}
								onSetAttr={(name, value) =>
									commit(setAttr(markup, selectedId, name, value))
								}
								onRenameAttr={(o, n) =>
									commit(renameAttr(markup, selectedId, o, n))
								}
								onRemoveAttr={n => commit(removeAttr(markup, selectedId, n))}
								onSetText={t => commit(setText(markup, selectedId, t))}
								onSetPath={d => commit(setAttr(markup, selectedId, 'd', d))}
								onAddCss={spec => commit(addCssAnim(markup, selectedId, spec))}
								onAddSmil={spec => commit(addSmil(markup, selectedId, spec))}
								onSetSmilAttr={(animId, attr, value) =>
									commit(setAttr(markup, animId, attr, value))
								}
								onRemoveSmil={animId => commit(removeSmil(markup, animId))}
								onDelete={onDelete}
							/>
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
