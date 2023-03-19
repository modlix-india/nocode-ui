import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { ComponentDefinitions } from '../../..';
import { DRAG_CD_KEY } from '../../../../constants';
import PageOperations from '../../functions/PageOperations';
import { ContextMenuDetails } from '../../components/ContextMenu';

interface SelectionBarProps {
	defPath: string | undefined;
	selectedComponent: string | undefined;
	pageExtractor: PageStoreExtractor;
	onSelectedComponentChanged: (key: string) => void;
	pageOperations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
}

export default function DnDBottomBar({
	defPath,
	selectedComponent,
	onSelectedComponentChanged,
	pageExtractor,
	pageOperations,
	onContextMenu,
}: SelectionBarProps) {
	const [map, setMap] = useState(new Map<string, string>());
	const [defMap, setDefMap] = useState<any>();
	const [menuForComponent, setMenuForComponent] = useState('');

	useEffect(() => setMenuForComponent(''), [selectedComponent]);

	useEffect(
		() =>
			addListenerAndCallImmediatelyWithChildrenActivity(
				(_, v) => {
					setDefMap(v);
					setMap(
						new Map<string, string>(
							Object.values(v ?? {})
								.map((e: any) => ({
									parentKey: e.key as string,
									children: Object.keys(e.children ?? {}),
								}))
								.filter(e => !!e.children.length)
								.flatMap(e => e.children.map(f => [f, e.parentKey])),
						),
					);
				},
				pageExtractor,
				`${defPath}.componentDefinition`,
			),
		[defPath, setMap],
	);

	const compPaths = new Array();
	let currentKey: string | undefined = selectedComponent;

	if (defMap && defPath && selectedComponent && currentKey) {
		do {
			let comp = defMap[currentKey];
			compPaths.push(
				<div
					className="_eachSelectionBar _iconMenu"
					title={comp.key}
					key={comp.key}
					tabIndex={0}
					role="button"
					onDoubleClick={() => onSelectedComponentChanged(comp.key)}
					onClick={() => setMenuForComponent(comp.key)}
					onMouseLeave={e => {
						if (e.target !== e.currentTarget) setMenuForComponent('');
					}}
					draggable="true"
					onDragStart={e =>
						e.dataTransfer.items.add(`${DRAG_CD_KEY}${comp.key}`, 'text/plain')
					}
					onDragOver={e => {
						e.preventDefault();
						e.stopPropagation();
						setMenuForComponent(comp.key);
					}}
					onDrop={e =>
						e.dataTransfer.items[0].getAsString(dragData =>
							pageOperations.droppedOn(comp.key, dragData),
						)
					}
					onContextMenu={e => {
						e.stopPropagation();
						e.preventDefault();
						onContextMenu({
							componentKey: comp.key,
							menuPosition: { x: e.screenX, y: e.screenY },
						});
					}}
				>
					<i className={`fa ${ComponentDefinitions.get(defMap[comp.key].type)?.icon}`} />
					{comp.name}
					<div
						className="_iconMenuBody _top _clickable"
						style={{ display: menuForComponent === comp.key ? 'block' : 'none' }}
					>
						{Object.keys(defMap[comp.key].children ?? {})
							.filter(f => !!defMap[f])
							.sort(
								(a, b) =>
									(defMap[a].displayOrder ?? 0) - (defMap[b].displayOrder ?? 0),
							)
							.map(f => (
								<div
									className="_iconMenuOption"
									tabIndex={0}
									key={f}
									onClick={() => onSelectedComponentChanged(f)}
									draggable="true"
									onDragEnd={e => {
										e.stopPropagation();
										e.preventDefault();
										// setMenuForComponent('');
									}}
									onDragStart={e => {
										e.stopPropagation();
										e.dataTransfer.items.add(
											`${DRAG_CD_KEY}${f}`,
											'text/plain',
										);
									}}
									onDragOver={e => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onDrop={e => {
										e.stopPropagation();
										e.dataTransfer.items[0].getAsString(dragData =>
											pageOperations.droppedOn(f, dragData),
										);
									}}
									onContextMenu={e => {
										e.stopPropagation();
										e.preventDefault();
										onContextMenu({
											componentKey: f,
											menuPosition: { x: e.screenX, y: e.screenY },
										});
									}}
								>
									<i
										className={`fa ${
											ComponentDefinitions.get(defMap[f].type)?.icon
										}`}
									/>
									{defMap[f].name}
								</div>
							))}
					</div>
				</div>,
			);
			currentKey = map.get(currentKey);
		} while (currentKey);
	}

	return (
		<div className="_selectionBar" onMouseLeave={() => setMenuForComponent('')}>
			{compPaths.reverse()}
		</div>
	);
}
