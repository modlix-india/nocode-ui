import {
	ExecutionGraph,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	LinkedList,
	Repository,
	Schema,
	StatementExecution,
	TokenValueExtractor,
	isNullValue,
} from '@fincity/kirun-js';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import duplicate from '../../util/duplicate';
import { UIError, toUIError } from '../util/errorHandling';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './KIRunEditorProperties';
import KIRunEditorStyle from './KIRunEditorStyle';
import { generateColor } from './colors';
import ExecutionGraphLines from './components/ExecutionGraphLines';
import KIRunContextMenu from './components/KIRunContextMenu';
import Search from './components/Search';
import StatementNode from './components/StatementNode';
import { StoreNode } from './components/StoreNode';
import { correctStatementNames, makeObjectPaths, savePersonalizationCurry } from './utils';
import StatementParameters from './components/StatementParameters';

const gridSize = 20;

function KIRunEditor(
	props: ComponentProps & {
		functionRepository?: Repository<Function>;
		schemaRepository?: Repository<Schema>;
		tokenValueExtractors?: Map<string, TokenValueExtractor>;
		stores?: Array<string>;
		storePaths?: Set<string>;
		hideArguments?: boolean;
	},
) {
	const {
		definition: { bindingPath, bindingPath2 },
		definition,
		context,
		locationHistory,
		functionRepository = UIFunctionRepository,
		schemaRepository = UISchemaRepository,
		tokenValueExtractors = new Map(),
		storePaths = new Set(),
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { readOnly, editorType, onDeletePersonalization, onChangePersonalization } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath!, locationHistory, pageExtractor)
		: undefined;

	const isReadonly = readOnly || !bindingPathPath;

	// Getting function definition.
	const [rawDef, setRawDef] = useState<any>();

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setRawDef(correctStatementNames(v)),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, setRawDef, pageExtractor]);

	const personalizationPath = bindingPath2
		? getPathFromLocation(bindingPath2!, locationHistory, pageExtractor)
		: undefined;
	const [preference, setPreference] = useState<any>({});
	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => setPreference({ ...(v ?? {}) }),
			pageExtractor,
			personalizationPath,
		);
	}, [personalizationPath]);

	const funDef = useMemo(
		() => (isNullValue(rawDef) ? undefined : FunctionDefinition.from(rawDef)),
		[rawDef],
	);

	// Making an executionPlan to show the execution graph.
	const [executionPlan, setExecutionPlan] = useState<
		ExecutionGraph<string, StatementExecution> | UIError | undefined
	>();
	const [kirunMessages, setKirunMessages] = useState<Map<string, string[]>>(new Map());
	useEffect(() => {
		if (isNullValue(funDef)) {
			setExecutionPlan(undefined);
			return;
		}

		(async () => {
			const fep = new FunctionExecutionParameters(functionRepository, schemaRepository, key);

			if (tokenValueExtractors.size) {
				fep.setValuesMap(tokenValueExtractors);
			}

			try {
				const ep = await new KIRuntime(funDef!, false).getExecutionPlan(
					functionRepository,
					schemaRepository,
				);
				setExecutionPlan(ep);

				const map = new Map();
				Array.from(ep.getNodeMap().values()).forEach(e => {
					map.set(
						e.getData().getStatement().getStatementName(),
						e
							.getData()
							.getMessages()
							.map(m => m.getMessage()),
					);
				});

				setKirunMessages(map);
			} catch (err) {
				setExecutionPlan(toUIError(err));
			}
		})();
	}, [funDef]);

	// TODO: Calculating the positions of each statement
	const [positions, setPositions] = useState<Map<string, { left: number; top: number }>>(
		new Map(),
	);
	useEffect(() => {
		if (!executionPlan) return;
		if ('message' in executionPlan) return;

		const positions: Map<string, { left: number; top: number }> = new Map();
		const list = new LinkedList(executionPlan.getVerticesWithNoIncomingEdges());
		const finishedSet = new Set<string>();
		let firstLeft = 20;
		let firstTop = 20;
		while (!list.isEmpty()) {
			const v = list.removeFirst();
			const s = v.getData().getStatement();
			finishedSet.add(s.getStatementName());
			if (v.getOutVertices().size) {
				list.addAll(
					Array.from(v.getOutVertices().values())
						.flatMap(e => Array.from(e))
						.filter(
							e => !finishedSet.has(e.getData().getStatement().getStatementName()),
						),
				);
			}

			if (
				isNullValue(s.getPosition()) ||
				((s.getPosition()?.getLeft() ?? 0) <= 0 && (s.getPosition()?.getTop() ?? 0) <= 0)
			) {
				if (!v.getInVertices() || !v.getInVertices().size) {
					positions.set(s.getStatementName(), { left: firstLeft, top: firstTop });
					firstTop += 100;
				}
				continue;
			}
		}

		setPositions(positions);
	}, [executionPlan]);

	const [selectedStatements, setSelectedStatements] = useState<Map<string, boolean>>(new Map());
	let statements: Array<ReactNode> = [];

	const selectStatement = useCallback(
		(append: boolean, statementName: string, selectOverride: boolean = false) => {
			if (!append) {
				setSelectedStatements(new Map([[statementName, true]]));
			} else {
				const newSelectedStatements = new Map(selectedStatements);
				if (!selectOverride && newSelectedStatements.has(statementName))
					newSelectedStatements.delete(statementName);
				else newSelectedStatements.set(statementName, true);
				setSelectedStatements(newSelectedStatements);
			}
		},
		[selectedStatements, setSelectedStatements],
	);

	const container = useRef<HTMLDivElement>(null);
	const [dragNode, setDragNode] = useState<
		| {
				left: number;
				top: number;
				dLeft?: number;
				dTop?: number;
		  }
		| undefined
	>();

	const savePersonalization = useMemo(() => {
		if (!personalizationPath) return (key: string, value: any) => {};

		return savePersonalizationCurry(
			personalizationPath,
			context.pageName,
			pageDefinition.eventFunctions?.[onChangePersonalization],
			locationHistory,
			pageDefinition,
		);
	}, [
		preference,
		personalizationPath,
		context,
		onChangePersonalization,
		locationHistory,
		pageDefinition,
	]);

	const functionNames = useMemo(() => functionRepository.filter(''), [functionRepository]);
	const [dragDependencyNode, setDragDependencyNode] = useState<any>();
	const [dragDependencyTo, setDragDependencyTo] = useState<any>();

	const deleteStatements = useCallback(
		(stmts: string[]) => {
			if (isReadonly || !stmts.length) return;
			const def = duplicate(rawDef);
			const newSelectedStatements = new Map(selectedStatements);
			for (let name of stmts) {
				delete def.steps[name];
				if (selectedStatements.has(name)) newSelectedStatements.delete(name);
			}

			setSelectedStatements(newSelectedStatements);
			setData(bindingPathPath, def, context.pageName);
		},
		[bindingPathPath, rawDef, selectedStatements, isReadonly, setData, context.pageName],
	);

	const [editParameters, setEditParameters] = useState<string>('');

	if (executionPlan && !('message' in executionPlan) && rawDef?.steps) {
		statements = Object.keys(rawDef.steps ?? {})
			.map(k => rawDef.steps[k])
			.map((s: any) => (
				<StatementNode
					statement={s}
					position={s.position ?? positions.get(s.statementName)}
					key={s.statementName}
					functionRepository={functionRepository}
					schemaRepository={schemaRepository}
					tokenValueExtractors={tokenValueExtractors}
					onClick={(append, statementName) => {
						selectStatement(append, statementName);
						setDragNode(undefined);
					}}
					selected={selectedStatements.has(s.statementName)}
					onDragStart={(append, statementName, startPosition) => {
						if (!selectedStatements.get(statementName))
							selectStatement(append, statementName, true);
						setDragNode(startPosition);
					}}
					dragNode={dragNode}
					container={container}
					executionPlanMessage={kirunMessages.get(s.statementName)}
					onChange={stmt => {
						if (isReadonly) return;

						const def = duplicate(rawDef);
						delete def.steps[s.statementName];
						def.steps[stmt.statementName] = stmt;

						setData(bindingPathPath, def, context.pageName);
					}}
					functionNames={functionNames}
					onDelete={stmt => deleteStatements([stmt])}
					onDependencyDragStart={(pos: any) => setDragDependencyNode(pos)}
					onDependencyDrop={stmt => {
						if (!dragDependencyNode) return;
						if (isReadonly) return;

						const newRawDef = duplicate(rawDef);

						if (!newRawDef.steps[stmt].dependentStatements)
							newRawDef.steps[stmt].dependentStatements = {};
						newRawDef.steps[stmt].dependentStatements[dragDependencyNode.dependency] =
							true;

						setDragDependencyNode(undefined);
						setDragDependencyTo(undefined);

						setData(bindingPathPath, newRawDef, context.pageName);
					}}
					showComment={!preference.showComments}
					onEditParameters={() => setEditParameters(s.statementName)}
					showParamValues={!!preference.showParamValues}
				/>
			));
	}

	let stores: ReactNode = <></>;

	const magnification = preference.magnification ?? 1;

	if (!preference?.showStores && props.stores && props.stores.length) {
		stores = (
			<div className="_storeContainer">
				{props.stores.map(storeName => (
					<StoreNode name={storeName} key={storeName} />
				))}
			</div>
		);
	}

	const [selectionBox, setSelectionBox] = useState<any>({});
	const [scrMove, setScrMove] = useState<any>({});
	const [primedToClick, setPrimedToClick] = useState(false);
	const [showAddSearch, setShowAddSearch] = useState<{ left: number; top: number }>();

	const designerMouseDown = useCallback(
		(e: any) => {
			if (e.target === e.currentTarget) setPrimedToClick(true);
			if (!container.current) return;

			if (e.buttons !== 1) return;
			// e.preventDefault();
			if (e.altKey) {
				setScrMove({
					...scrMove,
					dragStart: true,
					startLeft: e.screenX,
					startTop: e.screenY,
					oldLeft: container.current!.scrollLeft,
					oldTop: container.current!.scrollTop,
				});
			} else {
				const rect = container.current!.getBoundingClientRect();
				const left = e.clientX - rect.left + container.current!.scrollLeft;
				const top = e.clientY - rect.top + container.current!.scrollTop;
				setSelectionBox({ selectionStart: true, left, top });
			}
		},
		[setSelectionBox, setScrMove],
	);

	const designerMouseMove = useCallback(
		(e: any) => {
			if (!container.current) return;

			setPrimedToClick(false);
			const rect = container.current.getBoundingClientRect();
			const { dragStart, startLeft, startTop, oldLeft, oldTop } = scrMove;
			if (selectionBox.selectionStart || dragNode) {
				if (e.clientY - rect.top < gridSize * 1.5)
					container.current.scrollTop -= gridSize / 2;
				else if (e.clientY - rect.top + gridSize * 1.5 > rect.height)
					container.current.scrollTop += gridSize / 2;
				if (e.clientX - rect.left < gridSize * 1.5)
					container.current.scrollLeft -= gridSize / 2;
				else if (e.clientX - rect.left + gridSize * 1.5 > rect.width)
					container.current.scrollLeft += gridSize / 2;
			}

			if (selectionBox.selectionStart) {
				e.preventDefault();
				let { left, top } = selectionBox;
				let right = e.clientX - rect.left + container.current.scrollLeft;
				let bottom = e.clientY - rect.top + container.current.scrollTop;

				setSelectionBox({
					...selectionBox,
					left,
					top,
					right,
					bottom,
				});
			} else if (scrMove.dragStart) {
				e.preventDefault();
				container.current.scrollLeft = oldLeft + (startLeft - e.screenX);
				container.current.scrollTop = oldTop + (startTop - e.screenY);
			} else if (dragNode) {
				e.preventDefault();
				const dLeft = Math.round(
					e.clientX - rect.left + container.current.scrollLeft - dragNode.left,
				);
				const dTop = Math.round(
					e.clientY - rect.top + container.current.scrollTop - dragNode.top,
				);
				setDragNode({ ...dragNode, dLeft, dTop });
			} else if (dragDependencyNode) {
				e.preventDefault();
				const dLeft = Math.round(e.clientX - rect.left + container.current.scrollLeft);
				const dTop = Math.round(e.clientY - rect.top + container.current.scrollTop);
				setDragDependencyTo({ left: dLeft, top: dTop });
			}
		},
		[
			container,
			scrMove,
			selectionBox,
			dragNode,
			rawDef,
			setRawDef,
			selectedStatements,
			dragDependencyNode,
		],
	);

	const designerMouseUp = useCallback(
		(e: any) => {
			if (e.target === e.currentTarget && primedToClick) {
				setSelectedStatements(new Map());
				setPrimedToClick(false);
			}

			if (!dragNode && !scrMove && !selectionBox) {
				setSelectedStatements(new Map());
			}

			if (selectionBox.selectionStart) {
				let { left, top, right, bottom } = selectionBox;
				if (right < left) {
					const t = left;
					left = right;
					right = t;
				}
				if (bottom < top) {
					const t = top;
					top = bottom;
					bottom = t;
				}
				const boxRect = new DOMRect(left, top, right - left, bottom - top);
				const containerRect = container.current?.getBoundingClientRect();
				if (!isNaN(boxRect.width) && !isNaN(boxRect.height)) {
					const nodes = Object.keys(rawDef.steps || {})
						.filter(k => {
							const el = document.getElementById(`statement_${k}`);
							const rect = el?.getBoundingClientRect();
							if (!rect) return false;

							let { left, top, right, bottom, x, y } = rect;

							left +=
								(container.current?.scrollLeft || 0) - (containerRect?.left ?? 0);
							top += (container.current?.scrollTop || 0) - (containerRect?.top ?? 0);
							right +=
								(container.current?.scrollLeft || 0) - (containerRect?.left ?? 0);
							bottom +=
								(container.current?.scrollTop || 0) - (containerRect?.top ?? 0);

							if (boxRect.left > right || left > boxRect.right) return false;
							if (boxRect.top > bottom || top > boxRect.bottom) return false;

							return true;
						})
						.reduce((a, k) => {
							a.set(k, true);
							return a;
						}, new Map<string, boolean>());

					setSelectedStatements(nodes);
				} else {
					setSelectedStatements(new Map());
				}
			}

			setSelectionBox({ ...selectionBox, selectionStart: false });
			setScrMove({ ...scrMove, dragStart: false });

			setDragDependencyNode(undefined);
			setDragDependencyTo(undefined);

			if (dragNode) {
				const { dLeft, dTop } = dragNode;
				const def = duplicate(rawDef);
				if (def.steps) {
					for (const [name] of selectedStatements) {
						const step = def.steps[name];
						if (!step) continue;
						step.position = step.position ?? {};
						step.position.left =
							(!isNaN(step.position.left) ? step.position.left : 0) + (dLeft ?? 0);
						step.position.top =
							(!isNaN(step.position.top) ? step.position.top : 0) + (dTop ?? 0);
					}
				}

				if (!isReadonly) {
					setData(bindingPathPath, def, context.pageName);
				}
				setDragNode(undefined);
			}
		},
		[
			container,
			setDragNode,
			dragNode,
			setSelectedStatements,
			scrMove,
			selectionBox,
			rawDef,
			setRawDef,
			selectedStatements,
			isReadonly,
		],
	);

	let selector = undefined;
	if (selectionBox.selectionStart) {
		let { left, top, right, bottom } = selectionBox;
		selector = (
			<div
				className="_selectionBox"
				style={{
					left: `${Math.min(left, right) / magnification}px`,
					top: `${Math.min(top, bottom) / magnification}px`,
					width: `${Math.abs(left - right) / magnification}px`,
					height: `${Math.abs(top - bottom) / magnification}px`,
				}}
			/>
		);
	}

	const kirunStorePaths = useMemo(() => {
		const paths = new Set<string>(storePaths);

		if (!rawDef?.steps) return paths;

		for (const step of Object.values(rawDef.steps)) {
			if (isNullValue(step)) continue;

			const { namespace, name, statementName } = step as any;
			const func = functionRepository.find(namespace, name);
			if (!func) continue;

			const prefix = `Steps.${statementName}`;

			const events = func.getSignature().getEvents();
			if (events.size === 0) {
				paths.add(`${prefix}.output`);
				continue;
			}

			for (const event of events) {
				const eventName = `${prefix}.${event[1].getName()}`;
				paths.add(eventName);
				for (const [name, schema] of event[1].getParameters()) {
					const paramName = `${eventName}.${name}`;
					paths.add(paramName);
					makeObjectPaths(paramName, schema, schemaRepository, paths);
				}
			}
		}

		return paths;
	}, [storePaths, rawDef]);

	const designerRef = useRef<HTMLDivElement>(null);
	const [menu, showMenu] = useState<any>(undefined);

	let overLine = undefined;
	if (dragDependencyTo) {
		const sx = dragDependencyNode.left / magnification;
		const sy = dragDependencyNode.top / magnification;
		const ex = dragDependencyTo.left / magnification;
		const ey = dragDependencyTo.top / magnification;

		let dPath = `M ${sx} ${sy} Q ${sx + (ex - sx) / 3} ${sy} ${sx + (ex - sx) / 2} ${
			sy + (ey - sy) / 2
		} T ${ex} ${ey}`;

		const stepName = dragDependencyNode.dependency?.split('.')?.[1];
		const fromColor = stepName
			? generateColor(rawDef.steps[stepName].namespace, rawDef.steps[stepName].name)
			: '000000';

		overLine = (
			<svg className="_linesSvg _overLine">
				<path
					key="line_drag_path"
					d={dPath}
					role="button"
					className="_connector _selected"
					stroke={'#' + fromColor}
				/>
			</svg>
		);
	}

	const searchBox = showAddSearch ? (
		<div className="_statement _forAdd" style={{ ...showAddSearch }}>
			<Search
				options={functionNames.map(e => ({
					value: e,
				}))}
				onChange={value => {
					if (isReadonly) return;

					const index = value.lastIndexOf('.');

					const name = index === -1 ? value : value.substring(index + 1);
					const namespace = index === -1 ? '_' : value.substring(0, index);

					const def = duplicate(rawDef);
					let sName = name.substring(0, 1).toLowerCase() + name.substring(1);

					if (!def.steps) def.steps = {};

					let i = '';
					let num = 0;
					while (def.steps[`${sName}${i}`]) i = `${++num}`;

					sName = `${sName}${i}`;
					def.steps[sName] = {
						statementName: sName,
						name,
						namespace,
						position: showAddSearch,
					};
					setShowAddSearch(undefined);
					setData(bindingPathPath, def, context.pageName);
				}}
				onClose={() => {
					setShowAddSearch(undefined);
				}}
			/>
		</div>
	) : (
		<></>
	);

	let paramEditor = <></>;

	if (editParameters && rawDef?.steps?.[editParameters]) {
		const s = rawDef.steps[editParameters];
		paramEditor = (
			<StatementParameters
				position={rawDef?.steps?.[editParameters].position ?? positions.get(editParameters)}
				statement={rawDef?.steps?.[editParameters]}
				functionRepository={functionRepository}
				schemaRepository={schemaRepository}
				storePaths={storePaths}
				onEditParametersClose={() => setEditParameters('')}
			>
				<StatementNode
					statement={s}
					position={s.position ?? positions.get(s.statementName)}
					key={s.statementName}
					functionRepository={functionRepository}
					schemaRepository={schemaRepository}
					tokenValueExtractors={tokenValueExtractors}
					selected={selectedStatements.has(s.statementName)}
					dragNode={dragNode}
					container={container}
					executionPlanMessage={kirunMessages.get(s.statementName)}
					onChange={stmt => {
						if (isReadonly) return;

						const def = duplicate(rawDef);
						delete def.steps[s.statementName];
						def.steps[stmt.statementName] = stmt;

						if (s.statementName === editParameters)
							setEditParameters(stmt.statementName);
						setData(bindingPathPath, def, context.pageName);
					}}
					functionNames={functionNames}
					onDelete={stmt => deleteStatements([stmt])}
					showComment={true}
					onEditParameters={name => setEditParameters(name)}
					editParameters={true}
					showParamValues={true}
				/>
			</StatementParameters>
		);
	}

	return (
		<div className="comp compKIRunEditor">
			<div className="_header">
				<div className="_left">
					<i
						className="fa fa-solid fa-object-group"
						role="button"
						title="Select all"
						onClick={() => {
							const entries = Object.entries(rawDef.steps);

							setSelectedStatements(
								entries.length === selectedStatements.size
									? new Map()
									: new Map<string, boolean>(entries.map(([k, v]) => [k, true])),
							);
						}}
					/>
					<div className="_separator" />
					<i
						className="fa fa-solid fa-square-plus"
						role="button"
						title="Add Step"
						onClick={() => {
							if (isReadonly) return;
							setShowAddSearch({ left: 20, top: 20 });
						}}
					/>
					<i
						className="fa fa-solid fa-trash"
						role="button"
						title="Delete selected Steps"
						onClick={() => {
							if (isReadonly || !selectedStatements.size || !rawDef.steps) return;

							const def = duplicate(rawDef);
							for (const [name] of selectedStatements) {
								delete def.steps[name];
							}

							setData(bindingPathPath, def, context.pageName);
						}}
					/>
					<div className="_separator" />
					<i
						className="fa fa-solid fa-square-root-variable"
						role="button"
						title={
							!preference?.showParamValues
								? 'Show Parameter Values'
								: 'Hide Parameter Values'
						}
						onClick={() => {
							savePersonalization('showParamValues', !preference?.showParamValues);
						}}
					/>
					<i
						className="fa fa-regular fa-comment-dots"
						role="button"
						title={preference?.showComments ? 'Show Comments' : 'Hide Comments'}
						onClick={() => {
							savePersonalization(
								'showComments',
								preference?.showComments === undefined
									? true
									: !preference.showComments,
							);
						}}
					/>
					<i
						className="fa fa-solid fa-database"
						role="button"
						title={preference?.showStores ? 'Show Stores' : 'Hide Stores'}
						onClick={() => {
							savePersonalization(
								'showStores',
								preference?.showStores === undefined
									? true
									: !preference.showStores,
							);
						}}
					/>
				</div>
				<div className="_right">
					<i
						className="fa fa-solid fa-magnifying-glass-plus"
						role="button"
						title="Zoom in"
						onClick={() => savePersonalization('magnification', magnification + 0.1)}
					/>
					<i
						className="fa fa-solid fa-magnifying-glass"
						role="button"
						title="Reset zoom"
						onClick={() => savePersonalization('magnification', 1)}
					/>
					<i
						className="fa fa-solid fa-magnifying-glass-minus"
						role="button"
						title="Zoom out"
						onClick={() => savePersonalization('magnification', magnification - 0.1)}
					/>
				</div>
			</div>
			<div className="_container" ref={container}>
				<div
					className={`_designer ${scrMove.dragStart ? '_moving' : ''}`}
					style={{ transform: `scale(${magnification})` }}
					onMouseDown={designerMouseDown}
					onMouseMove={designerMouseMove}
					onMouseUp={designerMouseUp}
					onMouseLeave={designerMouseUp}
					onDoubleClick={ev => {
						ev.preventDefault();
						ev.stopPropagation();
						const parentRect = designerRef.current!.getBoundingClientRect();

						setShowAddSearch({
							left: ev.clientX - parentRect.left - 5,
							top: ev.clientY - parentRect.top - 5,
						});
					}}
					ref={designerRef}
					tabIndex={0}
					onKeyUp={ev => {
						if (ev.key === 'Delete' || ev.key === 'Backspace') {
							if (selectedStatements.size > 0)
								deleteStatements(Array.from(selectedStatements.keys()));
						} else if (
							(ev.key === 'a' || ev.key === 'A') &&
							(ev.ctrlKey || ev.metaKey)
						) {
							ev.stopPropagation();
							ev.preventDefault();
							const entries = Object.entries(rawDef.steps);

							setSelectedStatements(
								entries.length === selectedStatements.size
									? new Map()
									: new Map<string, boolean>(entries.map(([k, v]) => [k, true])),
							);
						} else if (ev.key === 'Escape') {
							setSelectedStatements(new Map());
						} else if (
							(ev.key === '+' || ev.key === '=' || ev.key === '-') &&
							(ev.ctrlKey || ev.metaKey)
						) {
							savePersonalization(
								'magnification',
								magnification + (ev.key === '-' ? -0.1 : 0.1),
							);
						}
					}}
					onContextMenu={ev => {
						ev.preventDefault();
						ev.stopPropagation();
						const parentRect = designerRef.current!.getBoundingClientRect();
						showMenu({
							position: {
								left: (ev.clientX - parentRect.left) / magnification,
								top: (ev.clientY - parentRect.top) / magnification,
							},
							type: 'designer',
							value: {},
						});
					}}
				>
					<ExecutionGraphLines
						executionPlan={executionPlan}
						designerRef={designerRef}
						rawDef={rawDef}
						selectedStatements={selectedStatements}
						menu={menu}
						setSelectedStatements={setSelectedStatements}
						functionRepository={functionRepository}
						showMenu={showMenu}
						stores={props.stores}
						showStores={!preference?.showStores}
						showParamValues={!preference?.showParamValues}
						hideArguments={props.hideArguments}
					/>
					{statements}
					{stores}
					{selector}
					<KIRunContextMenu
						menu={menu}
						showMenu={showMenu}
						isReadonly={isReadonly}
						rawDef={rawDef}
						bindingPathPath={bindingPathPath}
						pageName={context.pageName}
						setShowAddSearch={setShowAddSearch}
					/>
					{overLine}
					{searchBox}
				</div>
				{paramEditor}
			</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-regular fa-newspaper',
	name: 'KIRun Editor',
	displayName: 'KIRun Editor',
	description: 'KIRun Editor component',
	component: KIRunEditor,
	isHidden: true,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: KIRunEditorStyle,
	bindingPaths: {
		bindingPath: { name: 'Function Binding' },
		bindingPath2: { name: 'Personalization' },
	},
};

export default component;
