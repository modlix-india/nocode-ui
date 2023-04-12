import {
	ExecutionGraph,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	LinkedList,
	Position,
	Repository,
	Schema,
	StatementExecution,
	TokenValueExtractor,
	Tuple2,
	deepEqual,
	isNullValue,
} from '@fincity/kirun-js';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { UIError, toUIError } from '../util/errorHandling';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './KIRunEditorProperties';
import KIRunEditorStyle from './KIRunEditorStyle';
import StatementNode from './components/StatementNode';
import duplicate from '../../util/duplicate';

const gridSize = 20;

function KIRunEditor(
	props: ComponentProps & {
		functionRepository?: Repository<Function>;
		schemaRepository?: Repository<Schema>;
		tokenValueExtractors?: Map<string, TokenValueExtractor>;
	},
) {
	const {
		definition: { bindingPath },
		definition,
		context,
		locationHistory,
		functionRepository = UIFunctionRepository,
		schemaRepository = UISchemaRepository,
		tokenValueExtractors = new Map(),
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { readOnly, editorType } = {},
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
			(_, v) => setRawDef(v),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

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
				// setKirunMessages(new Map(ep.getT1().map(e => [e.getT1(), e.getT2()])));

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

				// map.set('genOutput', [
				// 	'This is a very long message from the KIRun runtime after fetching the execution plan. Please consider this message to change your atitude towards life.',
				// ]);

				setKirunMessages(map);
			} catch (err) {
				setExecutionPlan(toUIError(err));
			}
		})();
	}, [funDef]);

	// Calculating the positions of each statement
	const [positions, setPositions] = useState<Map<string, { left: number; top: number }>>(
		new Map(),
	);
	useEffect(() => {
		if (!executionPlan) return;
		if ('message' in executionPlan) return;

		const positions: Map<string, { left: number; top: number }> = new Map();
		const list = new LinkedList(executionPlan.getVerticesWithNoIncomingEdges());
		const finishedSet = new Set<string>();
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

			if (!isNullValue(s.getPosition())) {
				positions.set(s.getStatementName(), { left: 0, top: 0 });
				continue;
			}
		}
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

	const functionNames = useMemo(() => functionRepository.filter(''), [functionRepository]);

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
					onDelete={stmt => {
						if (isReadonly) return;
						const def = duplicate(rawDef);
						delete def.steps[s.statementName];
						if (!selectedStatements.has(s.statementName)) {
							const newSelectedStatements = new Map(selectedStatements);
							newSelectedStatements.delete(s.statementName);
							setSelectedStatements(newSelectedStatements);
						}

						setData(bindingPathPath, def, context.pageName);
					}}
				/>
			));
	}

	const [selectionBox, setSelectionBox] = useState<any>({});
	const [scrMove, setScrMove] = useState<any>({});
	const [primedToClick, setPrimedToClick] = useState(false);

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
			}
		},
		[container, scrMove, selectionBox, dragNode, rawDef, setRawDef, selectedStatements],
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
					left: `${Math.min(left, right)}px`,
					top: `${Math.min(top, bottom)}px`,
					width: `${Math.abs(left - right)}px`,
					height: `${Math.abs(top - bottom)}px`,
				}}
			/>
		);
	}

	return (
		<div className="comp compKIRunEditor" ref={container}>
			<div
				className={`_designer ${scrMove.dragStart ? '_moving' : ''}`}
				onMouseDown={designerMouseDown}
				onMouseMove={designerMouseMove}
				onMouseUp={designerMouseUp}
				onMouseLeave={designerMouseUp}
			>
				{statements}
				{selector}
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
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: KIRunEditorStyle,
	bindingPaths: {
		bindingPath: { name: 'Function Binding' },
	},
};

export default component;
