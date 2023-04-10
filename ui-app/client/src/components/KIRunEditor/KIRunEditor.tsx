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
	isNullValue,
} from '@fincity/kirun-js';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
} from '../../context/StoreContext';
import { UIFunctionRepository } from '../../functions';
import { UISchemaRepository } from '../../schemas/common';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { UIError, toUIError } from '../util/errorHandling';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './KIRunEditorProperties';
import KIRunEditorStyle from './KIRunEditorStyle';
import StatementNode from './components/StatementNode';

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

	const isReadonly = readOnly || !bindingPath;

	// Getting function definition.
	const [funDef, setFunDef] = useState<FunctionDefinition>();
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setFunDef(isNullValue(v) ? undefined : FunctionDefinition.from(v)),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	// Making an executionPlan to show the execution graph.
	const [executionPlan, setExecutionPlan] = useState<
		| Tuple2<Tuple2<string, string>[], ExecutionGraph<string, StatementExecution>>
		| UIError
		| undefined
	>();
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
				const ep = await new KIRuntime(funDef!, false).getExecutionPlan(fep);
				setExecutionPlan(ep);
			} catch (err) {
				setExecutionPlan(toUIError(err));
			}
		})();
	}, [funDef]);

	// Calculating the positions of each statement
	const [positions, setPositions] = useState<Map<string, Position>>(new Map<string, Position>());
	useEffect(() => {
		if (!executionPlan) return;
		if ('message' in executionPlan) return;

		const positions = new Map<string, Position>();
		const list = new LinkedList(executionPlan.getT2().getVerticesWithNoIncomingEdges());
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
				positions.set(s.getStatementName(), new Position(0, 0));
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
	const [dragNode, setDragNode] = useState<Position>();

	if (executionPlan && !('message' in executionPlan) && funDef?.getSteps()) {
		statements = Array.from(funDef.getSteps().values()).map(s => (
			<StatementNode
				statement={s}
				position={s.getPosition() ?? positions.get(s.getStatementName())}
				key={s.getStatementName()}
				functionRepository={functionRepository}
				schemaRepository={schemaRepository}
				tokenValueExtractors={tokenValueExtractors}
				onClick={selectStatement}
				selected={selectedStatements.has(s.getStatementName())}
				onDragStart={(append, statementName, startPosition) => {
					selectStatement(append, statementName, true);
					setDragNode(startPosition);
				}}
				container={container}
			/>
		));
	}

	const [selectionBox, setSelectionBox] = useState<any>({});
	const [scrMove, setScrMove] = useState<any>({});

	const designerMouseDown = useCallback(
		(e: any) => {
			if (!container.current) return;

			if (e.buttons !== 1) return;
			e.preventDefault();
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
			}
		},
		[container, scrMove, selectionBox, dragNode],
	);

	const designerMouseUp = useCallback((e: any) => {
		if (!dragNode && !scrMove && !selectionBox) {
			setSelectedStatements(new Map());
		}

		if (!dragNode && !scrMove && selectionBox) {
			let { left, top, width, height } = selectionBox;
			if (width && height) {
				width = left + width;
				height = top + height;
				if (left > width) {
					const t = left;
					left = width;
					width = t;
				}
				if (top > height) {
					const t = top;
					top = height;
					height = t;
				}

				//   const nodes = Object.entries(code?.definition?.steps || {})
				// 	.filter(([, v]) => {
				// 	  const { properties: { x, y } = {} } = v;
				// 	  return left <= x && x <= width && top <= y && y <= height;
				// 	})
				// 	.reduce((a, [k]) => {
				// 	  a.set(k, true)
				// 	  return a;
				// 	}, new Map<string, boolean>());
				//   setSelectedStatements(nodes);
			}
		}

		setSelectionBox({ ...selectionBox, selectionStart: false });
		setScrMove({ ...scrMove, dragStart: false });
		if (dragNode) {
			setDragNode(undefined);
		}
	}, []);

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
