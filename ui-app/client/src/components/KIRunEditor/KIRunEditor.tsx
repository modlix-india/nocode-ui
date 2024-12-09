import {
	ExecutionGraph,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	HybridRepository,
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
import { duplicate } from '@fincity/kirun-js';
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
import FunctionDetialsEditor from './components/FunctionDetailsEditor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { REPO_SERVER, RemoteRepository } from '../../Engine/RemoteRepository';
import { styleDefaults } from './KIRunEditorStyleProperties';
import { editor } from 'monaco-editor';
import { IconHelper } from '../util/IconHelper';

const gridSize = 20;

function makePositions(
	executionPlan: ExecutionGraph<string, StatementExecution> | UIError | undefined | undefined,
	setPositions: (p: Map<string, { left: number; top: number }>) => void,
) {
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
					.filter(e => !finishedSet.has(e.getData().getStatement().getStatementName())),
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
}

function makeUpdates(
	inFunDef: FunctionDefinition | undefined,
	setExecutionPlan: (p: ExecutionGraph<string, StatementExecution> | UIError | undefined) => void,
	setKirunMessages: (p: Map<string, string[]>) => void,
	functionRepository: Repository<Function>,
	schemaRepository: Repository<Schema>,
	key: string,
	tokenValueExtractors: Map<string, TokenValueExtractor>,
	setPositions: (p: Map<string, { left: number; top: number }>) => void,
) {
	if (isNullValue(inFunDef)) {
		setExecutionPlan(undefined);
		return;
	}

	(async () => {
		const fep = new FunctionExecutionParameters(functionRepository, schemaRepository, key);

		if (tokenValueExtractors.size) {
			fep.setValuesMap(tokenValueExtractors);
		}

		try {
			const ep = await new KIRuntime(
				inFunDef!,
				globalThis.isDesignMode || globalThis.isDebugMode,
			).getExecutionPlan(functionRepository, schemaRepository);
			setExecutionPlan(ep);
			makePositions(ep, setPositions);

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
}

function KIRunEditor(
	props: ComponentProps & {
		functionRepository?: Repository<Function>;
		schemaRepository?: Repository<Schema>;
		tokenValueExtractors?: Map<string, TokenValueExtractor>;
		stores?: Array<string>;
		storePaths?: Set<string>;
		hideArguments?: boolean;
		functionKey?: string;
	},
) {
	const {
		definition: { bindingPath, bindingPath2 },
		definition,
		context,
		locationHistory,
		functionRepository: actualFunctionRepository,
		schemaRepository: actualSchemaRepository,
		tokenValueExtractors = new Map(),
		storePaths = new Set(),
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			readOnly,
			editorType,
			onDeletePersonalization,
			onChangePersonalization,
			clientCode,
			appCode,
		} = {},
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
	const [name, setName] = useState<string>();
	const [selectedStatements, setSelectedStatements] = useState<Map<string, boolean>>(new Map());
	const [editParameters, setEditParameters] = useState<string>('');
	const [error, setError] = useState<any>();
	const [funDef, setFunDef] = useState<FunctionDefinition | undefined>();

	const functionRepository: Repository<Function> = useMemo(() => {
		if (actualFunctionRepository) return actualFunctionRepository;

		if (editorType === 'ui') {
			return new HybridRepository<Function>(
				UIFunctionRepository,
				RemoteRepository.getRemoteFunctionRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.UI,
				),
				RemoteRepository.getRemoteFunctionRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.CORE,
				),
			);
		} else if (editorType === 'core') {
			return RemoteRepository.getRemoteFunctionRepository(
				appCode,
				clientCode,
				true,
				REPO_SERVER.CORE,
			);
		}

		return UIFunctionRepository;
	}, [actualFunctionRepository, appCode, clientCode, editorType]);

	const schemaRepository: Repository<Schema> = useMemo(() => {
		if (actualSchemaRepository) return actualSchemaRepository;

		if (editorType === 'ui') {
			return new HybridRepository<Schema>(
				UISchemaRepository,
				RemoteRepository.getRemoteSchemaRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.UI,
				),
				RemoteRepository.getRemoteSchemaRepository(
					appCode,
					clientCode,
					false,
					REPO_SERVER.CORE,
				),
			);
		} else if (editorType === 'core') {
			return RemoteRepository.getRemoteSchemaRepository(
				appCode,
				clientCode,
				true,
				REPO_SERVER.CORE,
			);
		}
		return UISchemaRepository;
	}, [actualSchemaRepository, appCode, clientCode, editorType]);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => {
				const hereDef = correctStatementNames(v);
				setRawDef(hereDef);
				try {
					const inFunDef = isNullValue(hereDef)
						? undefined
						: FunctionDefinition.from(hereDef);
					setFunDef(inFunDef);
					makeUpdates(
						inFunDef,
						setExecutionPlan,
						setKirunMessages,
						functionRepository,
						schemaRepository,
						key,
						tokenValueExtractors,
						setPositions,
					);
					setError(undefined);
				} catch (error) {
					setError(error);
				}
				const finName = `${hereDef.namespace ?? '_'}.${hereDef.name}`;
				if (name !== finName) {
					setName(finName);
					setEditParameters('');
					setSelectedStatements(new Map());
				}
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, setRawDef, pageExtractor, name, setName, setSelectedStatements]);

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
	}, [personalizationPath, setPreference, pageExtractor]);

	// Making an executionPlan to show the execution graph.
	const [executionPlan, setExecutionPlan] = useState<
		ExecutionGraph<string, StatementExecution> | UIError | undefined
	>();
	const [kirunMessages, setKirunMessages] = useState<Map<string, string[]>>(new Map());
	useEffect(() => {}, [
		funDef,
		functionRepository,
		schemaRepository,
		tokenValueExtractors,
		key,
		setExecutionPlan,
		setKirunMessages,
		isDesignMode,
		isDebugMode,
	]);

	// TODO: Calculating the positions of each statement
	const [positions, setPositions] = useState<Map<string, { left: number; top: number }>>(
		new Map(),
	);

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

	const [functionNames, setFunctionNames] = useState<string[]>([]);

	useEffect(() => {
		(async () => {
			const filterNames = await functionRepository.filter('');
			setFunctionNames(filterNames);
		})();
	}, [functionRepository, setFunctionNames]);
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
				Object.values(def.steps).forEach((s: any) => {
					if (!s.dependentStatements) return;
					const keysToDelete = Object.keys(s.dependentStatements).filter(e =>
						e.startsWith(`Steps.${name}`),
					);
					keysToDelete.forEach(e => delete s.dependentStatements[e]);
				});
			}

			setSelectedStatements(newSelectedStatements);
			setData(bindingPathPath, def, context.pageName);
		},
		[bindingPathPath, rawDef, selectedStatements, isReadonly, setData, context.pageName],
	);

	const removeAllDependencies = useCallback(
		(stmt: string) => {
			if (isReadonly || !stmt) return;
			const def = duplicate(rawDef);
			delete def.steps[stmt].dependentStatements;
			setData(bindingPathPath, def, context.pageName);
		},
		[bindingPathPath, rawDef, isReadonly, setData, context.pageName],
	);

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
						if (dragDependencyNode.dependency?.startsWith(`Steps.${stmt}`)) return;

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
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					onRemoveAllDependencies={() => removeAllDependencies(s.statementName)}
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
					const nodes = Object.keys(rawDef?.steps || {})
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
					for (const [name] of Array.from(selectedStatements)) {
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

	// const [kirunStorePaths, setKirunStorePaths] = useState<Set<string>>(new Set());
	// useEffect(() => {
	// 	const paths = new Set<string>(storePaths);

	// 	if (!rawDef?.steps) {
	// 		setKirunStorePaths(paths);
	// 		return;
	// 	}
	// 	(async () => {
	// 		for (const step of Object.values(rawDef.steps)) {
	// 			if (isNullValue(step)) continue;

	// 			const { namespace, name, statementName } = step as any;
	// 			const func = await functionRepository.find(namespace, name);
	// 			if (!func) continue;

	// 			const prefix = `Steps.${statementName}`;

	// 			const events = func.getSignature().getEvents();
	// 			if (events.size === 0) {
	// 				paths.add(`${prefix}.output`);
	// 				continue;
	// 			}

	// 			for (const event of Array.from(events)) {
	// 				const eventName = `${prefix}.${event[1].getName()}`;
	// 				paths.add(eventName);
	// 				for (const [name, schema] of Array.from(event[1].getParameters())) {
	// 					const paramName = `${eventName}.${name}`;
	// 					paths.add(paramName);
	// 					await makeObjectPaths(paramName, schema, schemaRepository, paths);
	// 				}
	// 			}
	// 		}

	// 		setKirunStorePaths(paths);
	// 	})();
	// }, [storePaths, rawDef, functionRepository, schemaRepository]);

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
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					onRemoveAllDependencies={() => removeAllDependencies(s.statementName)}
				/>
			</StatementParameters>
		);
	}

	const [editFunction, setEditFunction] = useState<boolean>(false);

	let functionEditor = editFunction ? (
		<FunctionDetialsEditor
			functionKey={props.functionKey}
			rawDef={rawDef}
			onChange={(def: any) => {
				if (isReadonly) return;
				setData(bindingPathPath, def, context.pageName);
			}}
			onEditFunctionClose={() => setEditFunction(false)}
		/>
	) : (
		<></>
	);

	const editableIcons = isReadonly ? (
		<></>
	) : (
		<>
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
					for (const [name] of Array.from(selectedStatements)) {
						delete def.steps[name];
					}

					setData(bindingPathPath, def, context.pageName);
				}}
			/>
			<div className="_separator" />
		</>
	);

	const editPencilIcon = isReadonly ? (
		<></>
	) : (
		<i
			className="fa fa-solid fa-pencil"
			role="button"
			title="Edit Function"
			onClick={() => setEditFunction(true)}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let containerContents = <></>;

	if (!error) {
		containerContents = (
			<>
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
							left: (ev.clientX - parentRect.left - 5) / magnification,
							top: (ev.clientY - parentRect.top - 5) / magnification,
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
				{functionEditor}
			</>
		);
	} else {
		containerContents = <div className="_error">{error?.message ?? error}</div>;
	}

	// Here it is an exception for the style properties, we add comp page editor when used standalone.
	return (
		<div
			className={`comp compKIRunEditor ${!props.functionKey ? 'compPageEditor' : ''}`}
			style={resolvedStyles?.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
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
					{editableIcons}
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
					<div className="_separator" />
					{editPencilIcon}
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
				{containerContents}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'KIRun Editor',
	displayName: 'KIRun Editor',
	description: 'KIRun Editor component',
	component: KIRunEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: KIRunEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Function Binding' },
		bindingPath2: { name: 'Personalization' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.14429 9.80664V26.5148C7.14429 27.0671 7.592 27.5148 8.14429 27.5148H19.793"
						stroke="black"
						strokeOpacity="0.3"
						strokeWidth="0.75"
						strokeDasharray="2 1"
						fill="none"
					/>
					<path
						d="M24.7 18.6621V4.48371C24.7 3.93143 24.2522 3.48371 23.7 3.48371H12.0513"
						stroke="black"
						strokeOpacity="0.3"
						strokeWidth="0.75"
						strokeDasharray="2 1"
						fill="none"
					/>
					<circle className="_circle11" cx="8.72538" cy="3.67326" r="2" fill="#00ADB7" />
					<path
						d="M2.55914 0.953125C1.59987 0.953125 0.819946 1.73304 0.819946 2.69232V4.43151C0.819946 5.39078 1.59987 6.1707 2.55914 6.1707H12.9943C13.9536 6.1707 14.7335 5.39078 14.7335 4.43151V2.69232C14.7335 1.73304 13.9536 0.953125 12.9943 0.953125H2.55914ZM10.1681 2.90972C10.3411 2.90972 10.507 2.97843 10.6293 3.10074C10.7516 3.22305 10.8203 3.38894 10.8203 3.56191C10.8203 3.73489 10.7516 3.90077 10.6293 4.02309C10.507 4.1454 10.3411 4.21411 10.1681 4.21411C9.99513 4.21411 9.82924 4.1454 9.70693 4.02309C9.58462 3.90077 9.5159 3.73489 9.5159 3.56191C9.5159 3.38894 9.58462 3.22305 9.70693 3.10074C9.82924 2.97843 9.99513 2.90972 10.1681 2.90972ZM11.4725 3.56191C11.4725 3.38894 11.5412 3.22305 11.6635 3.10074C11.7858 2.97843 11.9517 2.90972 12.1247 2.90972C12.2977 2.90972 12.4636 2.97843 12.5859 3.10074C12.7082 3.22305 12.7769 3.38894 12.7769 3.56191C12.7769 3.73489 12.7082 3.90077 12.5859 4.02309C12.4636 4.1454 12.2977 4.21411 12.1247 4.21411C11.9517 4.21411 11.7858 4.1454 11.6635 4.02309C11.5412 3.90077 11.4725 3.73489 11.4725 3.56191ZM2.55914 7.90989C1.59987 7.90989 0.819946 8.68981 0.819946 9.64908V11.3883C0.819946 12.3475 1.59987 13.1275 2.55914 13.1275H12.9943C13.9536 13.1275 14.7335 12.3475 14.7335 11.3883V9.64908C14.7335 8.68981 13.9536 7.90989 12.9943 7.90989H2.55914ZM10.1681 9.86648C10.3411 9.86648 10.507 9.93519 10.6293 10.0575C10.7516 10.1798 10.8203 10.3457 10.8203 10.5187C10.8203 10.6917 10.7516 10.8575 10.6293 10.9798C10.507 11.1022 10.3411 11.1709 10.1681 11.1709C9.99513 11.1709 9.82924 11.1022 9.70693 10.9798C9.58462 10.8575 9.5159 10.6917 9.5159 10.5187C9.5159 10.3457 9.58462 10.1798 9.70693 10.0575C9.82924 9.93519 9.99513 9.86648 10.1681 9.86648ZM11.6899 10.5187C11.6899 10.3457 11.7586 10.1798 11.8809 10.0575C12.0032 9.93519 12.1691 9.86648 12.3421 9.86648C12.5151 9.86648 12.681 9.93519 12.8033 10.0575C12.9256 10.1798 12.9943 10.3457 12.9943 10.5187C12.9943 10.6917 12.9256 10.8575 12.8033 10.9798C12.681 11.1022 12.5151 11.1709 12.3421 11.1709C12.1691 11.1709 12.0032 11.1022 11.8809 10.9798C11.7586 10.8575 11.6899 10.6917 11.6899 10.5187Z"
						fill="#BC065B"
					/>
					<path
						d="M10.1681 2.90972C10.3411 2.90972 10.507 2.97843 10.6293 3.10074C10.7516 3.22305 10.8203 3.38894 10.8203 3.56191C10.8203 3.73489 10.7516 3.90077 10.6293 4.02309C10.507 4.1454 10.3411 4.21411 10.1681 4.21411C9.99513 4.21411 9.82924 4.1454 9.70693 4.02309C9.58462 3.90077 9.5159 3.73489 9.5159 3.56191C9.5159 3.38894 9.58462 3.22305 9.70693 3.10074C9.82924 2.97843 9.99513 2.90972 10.1681 2.90972Z"
						fill="#BC065B"
					/>
					<path
						d="M11.4725 3.56191C11.4725 3.38894 11.5412 3.22305 11.6635 3.10074C11.7858 2.97843 11.9517 2.90972 12.1247 2.90972C12.2977 2.90972 12.4636 2.97843 12.5859 3.10074C12.7082 3.22305 12.7769 3.38894 12.7769 3.56191C12.7769 3.73489 12.7082 3.90077 12.5859 4.02309C12.4636 4.1454 12.2977 4.21411 12.1247 4.21411C11.9517 4.21411 11.7858 4.1454 11.6635 4.02309C11.5412 3.90077 11.4725 3.73489 11.4725 3.56191Z"
						fill="#BC065B"
					/>
					<path
						d="M10.1681 9.86648C10.3411 9.86648 10.507 9.93519 10.6293 10.0575C10.7516 10.1798 10.8203 10.3457 10.8203 10.5187C10.8203 10.6917 10.7516 10.8575 10.6293 10.9798C10.507 11.1022 10.3411 11.1709 10.1681 11.1709C9.99513 11.1709 9.82924 11.1022 9.70693 10.9798C9.58462 10.8575 9.5159 10.6917 9.5159 10.5187C9.5159 10.3457 9.58462 10.1798 9.70693 10.0575C9.82924 9.93519 9.99513 9.86648 10.1681 9.86648Z"
						fill="#BC065B"
					/>
					<path
						d="M11.6899 10.5187C11.6899 10.3457 11.7586 10.1798 11.8809 10.0575C12.0032 9.93519 12.1691 9.86648 12.3421 9.86648C12.5151 9.86648 12.681 9.93519 12.8033 10.0575C12.9256 10.1798 12.9943 10.3457 12.9943 10.5187C12.9943 10.6917 12.9256 10.8575 12.8033 10.9798C12.681 11.1022 12.5151 11.1709 12.3421 11.1709C12.1691 11.1709 12.0032 11.1022 11.8809 10.9798C11.7586 10.8575 11.6899 10.6917 11.6899 10.5187Z"
						fill="#BC065B"
					/>
					<path
						d="M18.5281 19.4538C19.7749 20.4005 22.3184 20.9002 24.7528 20.9002C27.1872 20.9002 29.7306 20.4005 30.9775 19.4538V21.4329C30.9775 22.3735 28.3154 23.4255 24.7528 23.4255C21.1902 23.4255 18.5281 22.3735 18.5281 21.4329V19.4538ZM18.5281 24.7424C18.5281 25.6829 21.1902 26.7349 24.7528 26.7349C28.3154 26.7349 30.9775 25.6829 30.9775 24.7424V22.7632C29.7306 23.7098 27.1872 24.2096 24.7528 24.2096C22.3184 24.2096 19.7749 23.7098 18.5281 22.7632V24.7424ZM18.5281 28.0518C18.5281 28.9924 21.1902 30.0444 24.7528 30.0444C28.3154 30.0444 30.9775 28.9924 30.9775 28.0518V26.0727C29.7306 27.0193 27.1872 27.5191 24.7528 27.5191C22.3184 27.5191 19.7749 27.0193 18.5281 26.0727V28.0518ZM30.9775 18.1234C30.9775 17.1829 28.3154 16.1309 24.7528 16.1309C21.1902 16.1309 18.5281 17.1829 18.5281 18.1234C18.5281 19.0641 21.1902 20.1161 24.7528 20.1161C28.3154 20.1161 30.9775 19.0641 30.9775 18.1234Z"
						fill="#00ADB7"
					/>
					<circle cx="8.72538" cy="3.67326" r="0.94865" fill="white" />
					<circle cx="8.72538" cy="10.5033" r="0.94865" fill="white" />
					<circle cx="12.3935" cy="3.67326" r="0.94865" fill="white" />
					<circle cx="12.3935" cy="10.5033" r="0.94865" fill="white" />
				</IconHelper>
			),
		},
	],
};

export default component;
