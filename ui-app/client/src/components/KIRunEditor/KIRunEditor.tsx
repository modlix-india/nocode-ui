import {
	ExecutionGraph,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	KIRuntime,
	LinkedList,
	ParameterReferenceType,
	Repository,
	Schema,
	StatementExecution,
	TokenValueExtractor,
	isNullValue,
	Parameter,
} from '@fincity/kirun-js';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
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
import StatementNode from './components/StatementNode';
import { generateColor } from './colors';

const gridSize = 20;

const STEP_REGEX = /Steps\.([a-zA-Z0-9\-]{1,})\.([a-zA-Z0-9\-]{1,})([\.]{0,}[a-zA-Z0-9\-]{1,})+/g;

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
					left: `${Math.min(left, right)}px`,
					top: `${Math.min(top, bottom)}px`,
					width: `${Math.abs(left - right)}px`,
					height: `${Math.abs(top - bottom)}px`,
				}}
			/>
		);
	}

	const designerRef = useRef<HTMLDivElement>(null);
	const [menu, showMenu] = useState<any>(undefined);

	let lines: Array<ReactNode> = [];
	let gradients: Map<string, ReactNode> = new Map();

	const [magnification, setMagnification] = useState(1);

	if (executionPlan instanceof ExecutionGraph && designerRef.current) {
		const nodeMap = executionPlan.getNodeMap();
		lines = Array.from(nodeMap.values()).flatMap(v => {
			const statement = v.getData().getStatement();
			const depNode = document.getElementById(
				`eventNode_dependentNode_${statement.getStatementName()}`,
			);
			if (!depNode) return [];
			const toColor = generateColor(statement.getNamespace(), statement.getName());
			const array: Array<ReactNode> = Array.from(statement.getDependentStatements().entries())
				.filter(e => e[1])
				.map(e => e[0])
				.map(e => {
					const names = e.split('.');
					if (names.length < 3) return;
					const fromNode = document.getElementById(
						names.length > 3
							? `eventParameter_${names[1]}_${names[2]}_${names[3]}`
							: `eventNode_${names[1]}_${names[2]}`,
					);
					if (!fromNode || !rawDef.steps[names[1]]) return;
					const fromColor = generateColor(
						rawDef.steps[names[1]].namespace,
						rawDef.steps[names[1]].name,
					);
					makeGradients(fromColor, toColor, gradients);
					return lineFrom(
						fromNode,
						depNode,
						designerRef.current!,
						fromColor,
						toColor,
						{
							className: `_connector ${
								selectedStatements.get(statement.getStatementName()) ||
								selectedStatements.get(names[1]) ||
								(menu?.type === 'dependent' &&
									menu.value.statementName === statement.getStatementName() &&
									menu.value.dependency === e)
									? '_selected'
									: ''
							}`,
							onClick: () => {
								setSelectedStatements(
									new Map<string, boolean>([
										[statement.getStatementName(), true],
										[names[1], true],
									]),
								);
							},
							onContextMenu: (ev: MouseEvent) => {
								ev.preventDefault();
								ev.stopPropagation();
								const parentRect = designerRef.current!.getBoundingClientRect();
								showMenu({
									position: {
										x: ev.clientX - parentRect.left,
										y: ev.clientY - parentRect.top,
									},
									type: 'dependent',
									value: {
										statementName: statement.getStatementName(),
										dependency: e,
									},
								});
							},
						},
						true,
					);
				});

			const functionSignature = functionRepository
				.find(statement.getNamespace(), statement.getName())
				?.getSignature();

			if (!functionSignature) return array;
			const inLines = Array.from(functionSignature.getParameters().values() ?? []).map(
				(p: Parameter) => {
					const paramValue = statement.getParameterMap()?.get(p.getParameterName());
					if (!paramValue) return undefined;

					const toNode = document.getElementById(
						`paramNode_${statement.getStatementName()}_${p.getParameterName()}`,
					);
					if (!toNode) return undefined;

					const toColor = generateColor(statement.getNamespace(), statement.getName());

					return Array.from(paramValue.values() ?? []).flatMap(pr => {
						if (!pr) return undefined;
						if (pr.getType() === ParameterReferenceType.EXPRESSION) {
							let expression = pr.getExpression();
							if (!expression) return undefined;

							return makeLineFromExpression(
								expression,
								rawDef,
								toColor,
								gradients,
								toNode,
								statement.getStatementName(),
								designerRef,
								selectedStatements,
								setSelectedStatements,
							);
						} else if (typeof pr.getValue() === 'object') {
							//TODO: work on this
						}
						return undefined;
					});
				},
			);
			array.push(...inLines);

			return array;
		});
	}

	let overLine = undefined;
	if (dragDependencyTo) {
		const sx = dragDependencyNode.left;
		const sy = dragDependencyNode.top;
		const ex = dragDependencyTo.left;
		const ey = dragDependencyTo.top;

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

	let lineSvg = (
		<svg className="_linesSvg">
			<defs>{Array.from(gradients.values())}</defs>
			{lines}
		</svg>
	);

	let menuDiv = undefined;

	if (menu) {
		menuDiv = (
			<div
				className="_menu"
				style={{
					left: `${menu.position.x - 5}px`,
					top: `${menu.position.y - 5}px`,
				}}
				onMouseLeave={() => showMenu(undefined)}
			>
				{menu.type === 'dependent' && (
					<>
						<div
							className="_menuItem"
							onClick={() => {
								if (isReadonly) return;

								const newDef = duplicate(rawDef);
								const statement = newDef.steps[menu.value.statementName];
								if (!statement) return;
								const dependentStatements = statement.dependentStatements;
								if (!dependentStatements) return;
								dependentStatements[menu.value.dependency] = false;
								showMenu(undefined);
								setData(bindingPathPath, newDef, context.pageName);
							}}
						>
							<i className="fa fa-regular fa-trash-can" /> Remove
						</div>
					</>
				)}
			</div>
		);
	}

	return (
		<div className="comp compKIRunEditor">
			<div className="_header">
				<div className="_left" />
				<div className="_right">
					<i
						className="fa fa-solid fa-magnifying-glass-plus"
						role="button"
						onClick={() => setMagnification(magnification + 0.1)}
					/>
					<i
						className="fa fa-solid fa-magnifying-glass"
						role="button"
						onClick={() => setMagnification(1)}
					/>
					<i
						className="fa fa-solid fa-magnifying-glass-minus"
						role="button"
						onClick={() => setMagnification(magnification - 0.1)}
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
					ref={designerRef}
					tabIndex={0}
					onKeyUp={ev => {
						if (ev.key === 'Delete' || ev.key === 'Backspace') {
							if (selectedStatements.size > 0)
								deleteStatements(Array.from(selectedStatements.keys()));
						}
					}}
				>
					{lineSvg}
					{statements}
					{selector}
					{menuDiv}
					{overLine}
				</div>
			</div>
		</div>
	);
}

function makeLineFromExpression(
	expression: string,
	rawDef: any,
	toColor: string,
	gradients: Map<string, React.ReactNode>,
	toNode: HTMLElement,
	statementName: string,
	designerRef: React.RefObject<HTMLDivElement>,
	selectedStatements: Map<string, boolean>,
	setSelectedStatements: (statements: Map<string, boolean>) => void,
	props: any = {},
): ReactNode[] {
	const lines: ReactNode[] = Array.from(expression.match(STEP_REGEX) ?? []).flatMap(
		(e: string) => {
			const names = e.split('.');
			if (names.length < 3) return undefined;
			const fromNode = document.getElementById(
				names.length > 3
					? `eventParameter_${names[1]}_${names[2]}_${names[3]}`
					: `eventNode_${names[1]}_${names[2]}`,
			);
			if (!fromNode || !rawDef.steps[names[1]]) return undefined;
			const fromColor = generateColor(
				rawDef.steps[names[1]].namespace,
				rawDef.steps[names[1]].name,
			);
			makeGradients(fromColor, toColor, gradients);
			return lineFrom(
				fromNode,
				toNode,
				designerRef.current!,
				fromColor,
				toColor,
				{
					...props,

					className: `_connector ${
						selectedStatements.get(statementName) || selectedStatements.get(names[1])
							? '_selected'
							: ''
					}`,

					onClick: () => {
						setSelectedStatements(
							new Map([
								[statementName, true],
								[names[1], true],
							]),
						);
					},
				},
				false,
			);
		},
	);

	return lines;
}

function makeGradients(fromColor: string, toColor: string, gradients: Map<string, ReactNode>) {
	const gradName = `grad_${fromColor}_${toColor}`;
	const revGradNam = `grad_${toColor}_${fromColor}`;
	if (gradients.has(gradName)) return;

	gradients.set(
		gradName,
		<linearGradient key={gradName} id={gradName} x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stopColor={`#${fromColor}`} />
			<stop offset="100%" stopColor={`#${toColor}`} />
		</linearGradient>,
	);

	gradients.set(
		revGradNam,
		<linearGradient key={revGradNam} id={revGradNam} x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" stopColor={`#${toColor}`} />
			<stop offset="100%" stopColor={`#${fromColor}`} />
		</linearGradient>,
	);
}

function lineFrom(
	fromNode: HTMLElement,
	toNode: HTMLElement,
	parentElement: HTMLElement,
	fromColor: string,
	toColor: string,
	props: any = {},
	isNodeOnTop = false,
): ReactNode {
	if (!fromNode || !toNode || !fromNode.parentElement || !toNode.parentElement || !parentElement)
		return <></>;
	const fromRect = fromNode.getBoundingClientRect();
	const toRect = toNode.getBoundingClientRect();
	const parentRect = parentElement.getBoundingClientRect();

	const magnification = parentRect.width / parentElement.offsetWidth;
	const sx = (fromRect.left - parentRect.left) / magnification;
	const sy = (fromRect.top - parentRect.top) / magnification;
	const ex = (toRect.left - parentRect.left) / magnification;
	const ey = (toRect.top - parentRect.top) / magnification;

	let dPath = `M ${sx} ${sy} `;
	if (isNodeOnTop)
		dPath += `C ${sx + (ex - sx) / 1.5} ${sy} ${ex} ${
			ey - Math.abs(ey - sy) / 0.98
		} ${ex} ${ey}`;
	else {
		if (Math.abs(sy - ey) < 0.4) {
			props = { ...props, className: `${props.className ?? ''} _straight` };
			dPath += `L ${ex} ${sy} L ${ex} ${ey + 1} L ${sx} ${ey + 1} Z`;
		} else {
			dPath += `Q ${sx + (ex - sx) / 3} ${sy} ${sx + (ex - sx) / 2} ${
				sy + (ey - sy) / 2
			} T ${ex} ${ey}`;
		}
	}
	return (
		<path
			key={`line_${sx}_${sy}_${ex}_${ey}`}
			d={dPath}
			role="button"
			{...props}
			stroke={`url(#grad_${sx < ex ? fromColor : toColor}_${ex < sx ? fromColor : toColor})`}
		/>
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
