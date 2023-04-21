import {
	ExecutionGraph,
	Function,
	Parameter,
	ParameterReferenceType,
	Repository,
	StatementExecution,
} from '@fincity/kirun-js';
import React, { ReactNode } from 'react';
import { UIError } from '../../util/errorHandling';
import { generateColor } from '../colors';

interface ExecutionGraphLinesProps {
	executionPlan: ExecutionGraph<string, StatementExecution> | UIError | undefined;
	designerRef: React.RefObject<HTMLDivElement>;
	rawDef: any;
	selectedStatements: Map<string, boolean>;
	menu: any;
	setSelectedStatements: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
	functionRepository: Repository<Function>;
	showMenu: React.Dispatch<any>;
}

const STEP_REGEX = /Steps\.([a-zA-Z0-9\-]{1,})\.([a-zA-Z0-9\-]{1,})([\.]{0,}[a-zA-Z0-9\-]{1,})+/g;

export default function ExecutionGraphLines({
	executionPlan,
	designerRef,
	rawDef,
	selectedStatements,
	menu,
	setSelectedStatements,
	functionRepository,
	showMenu,
}: ExecutionGraphLinesProps) {
	if (!(executionPlan instanceof ExecutionGraph) || !designerRef.current) return <></>;

	const nodeMap = executionPlan.getNodeMap();

	let gradients: Map<string, ReactNode> = new Map();
	const lines = Array.from(nodeMap.values()).flatMap(v => {
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
									left: ev.clientX - parentRect.left,
									top: ev.clientY - parentRect.top,
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

	return (
		<svg className="_linesSvg">
			<defs>{Array.from(gradients.values())}</defs>
			{lines}
		</svg>
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
		if (Math.abs(sy - ey) < 0.4 || Math.abs(sx - ex) < 0.4) {
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
