import {
	Function,
	Position,
	Repository,
	Schema,
	Statement,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import React, { RefObject, useCallback, useEffect, useState } from 'react';

interface StatementProps {
	position?: { left: number; top: number };
	statement: any;
	functionRepository: Repository<Function>;
	schemaRepository: Repository<Schema>;
	tokenValueExtractors: Map<string, TokenValueExtractor>;
	onDragStart: (
		append: boolean,
		statementName: string,
		startPosition: { left: number; top: number } | undefined,
	) => void;
	selected: boolean;
	onClick: (append: boolean, statementName: string) => void;
	container: RefObject<HTMLDivElement>;
	dragNode: any;
}

function generateNumber(str: string) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	if (hash < 0) hash = -hash;
	hash += 12;
	return hash % SIDE_COLORS.length;
}

const DEFAULT_POSITION = { left: 0, top: 0 };
export default function StatementNode({
	position = DEFAULT_POSITION,
	statement,
	functionRepository,
	onDragStart,
	onClick,
	selected = false,
	container,
	dragNode,
}: StatementProps) {
	const [statementName, setStatementName] = useState(statement.statementName);
	const [name, setName] = useState(
		((statement.namespace ?? '_') === '_' ? '' : statement.namespace + '.') + statement.name,
	);

	useEffect(() => {
		setStatementName(statement.statementName);
		setName(
			((statement.namespace ?? '_') === '_' ? '' : statement.namespace + '.') +
				statement.name,
		);
	}, [statement]);

	const [mouseMove, setMouseMove] = useState(false);
	return (
		<div
			className={`_statement ${selected ? '_selected' : ''}`}
			style={{
				left: position.left + (selected && dragNode ? dragNode.dLeft : 0) + 'px',
				top: position.top + (selected && dragNode ? dragNode.dTop : 0) + 'px',
				borderColor: selected
					? SIDE_COLORS[generateNumber(statement.namespace + statement.name)]
					: '',
				zIndex: selected ? '3' : '',
			}}
			id={`statement_${statement.statementName}`}
		>
			<div
				className="_nameContainer"
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();

					if (e.button !== 0) return;

					const rect = container.current!.getBoundingClientRect();
					const left = Math.round(e.clientX - rect.left + container.current!.scrollLeft);
					const top = Math.round(e.clientY - rect.top + container.current!.scrollTop);
					onDragStart(e.ctrlKey || e.metaKey, statement.statementName, { left, top });
				}}
				onMouseMove={e => {
					if (!mouseMove && dragNode) setMouseMove(true);
				}}
				onMouseUp={e => {
					if (e.button !== 0) return;

					if (e.target === e.currentTarget && !mouseMove) {
						e.preventDefault();
						e.stopPropagation();
						onClick(e.ctrlKey || e.metaKey, statement.statementName);
					}
					setMouseMove(false);
				}}
				onDoubleClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				<i
					className={`_icon fa fa-solid ${
						ICONS_GROUPS.get(statement.namespace) ?? 'fa-microchip'
					}`}
					style={{
						backgroundColor:
							SIDE_COLORS[generateNumber(statement.namespace + statement.name)],
					}}
				></i>
				<div className={`_statementName`}>{statementName}</div>
				<i className="_editIcon fa fa-1x fa-solid fa-pencil" />
			</div>
			<div className="_otherContainer">
				<div className={`_name`}>{name}</div>
			</div>
		</div>
	);
}

const ICONS_GROUPS = new Map<string, string>([
	['System', 'fa-cube'],
	['System.Context', 'fa-hard-drive'],
	['System.Loop', 'fa-ring'],
	['System.Math', 'fa-calculator'],
	['System.String', 'fa-candy-cane'],
	['System.Array', 'fa-layer-group'],
	['UIEngine', 'fa-snowflake'],
]);

const SIDE_COLORS = [
	'#679ae6',
	'#00b9f6',
	'#00d4e7',
	'#00e8bf',
	'#9af58f',
	'#f9f871',
	'#7887da',
	'#8973c9',
	'#985eb2',
	'#a24698',
	'#a62b79',
	'#2567ae',
	'#663f00',
	'#887455',
	'#404756',
	'#a4abbd',
	'#e27892',
	'#a74460',
	'#26605c',
	'#002a66',

	'#d9f0ed',
	'#328c86',
	'#73fac9',
	'#2fc193',
	'#008a60',
	'#7b91bc',

	'#e57d41',
	'#00b1ab',
	'#bea5a9',
	'#00c0f8',
	'#00e0ea',
	'#ee7561',
	'#28ad70',
	'#004bb6',
	'#508984',
	'#005a55',
	'#0e2624',

	'#948bfb',
	'#fc648f',
	'#00498b',
	'#d9a21b',
	'#407ac2',
	'#055ba0',
	'#003e7e',
	'#00235f',
	'#00174f',
	'#81b2ff',
	'#558ad5',
	'#6497e3',
];
