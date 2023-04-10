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
	position?: Position;
	statement: Statement;
	functionRepository: Repository<Function>;
	schemaRepository: Repository<Schema>;
	tokenValueExtractors: Map<string, TokenValueExtractor>;
	onDragStart: (append: boolean, statementName: string, startPosition: Position) => void;
	selected: boolean;
	onClick: (append: boolean, statementName: string) => void;
	container: RefObject<HTMLDivElement>;
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

export default function StatementNode({
	position = new Position(0, 0),
	statement,
	functionRepository,
	onDragStart,
	onClick,
	selected = false,
	container,
}: StatementProps) {
	const [statementName, setStatementName] = useState(statement.getStatementName());
	const [name, setName] = useState(
		((statement.getNamespace() ?? '_') === '_' ? '' : statement.getNamespace() + '.') +
			statement.getName(),
	);

	useEffect(() => {
		setStatementName(statement.getStatementName());
		setName(
			((statement.getNamespace() ?? '_') === '_' ? '' : statement.getNamespace() + '.') +
				statement.getName(),
		);
	}, [statement]);

	const [pos, setPos] = useState(position);
	useEffect(() => setPos(position), [position, setPos]);

	const [mouseDown, setMouseDown] = useState(false);
	const [mouseMove, setMouseMove] = useState(false);

	const nodeMouseMove = useCallback(
		(e: any) => {
			if (!mouseDown) return;

			if (e.type === 'mouseup') {
				if (!mouseMove && e.button === 0) {
					e.stopPropagation();
					e.preventDefault();
					onClick(e.shiftKey, statement.getStatementName());
				}
				setMouseMove(false);
				setMouseDown(false);
			} else if (!mouseMove) {
				const rect = container.current!.getBoundingClientRect();
				const left = e.clientX - rect.left + container.current!.scrollLeft;
				const top = e.clientY - rect.top + container.current!.scrollTop;
				setMouseMove(true);
				onDragStart(e.shiftKey, statement.getStatementName(), new Position(left, top));
			}
		},
		[mouseDown, onClick, onDragStart, statement, container, mouseMove],
	);

	return (
		<div
			className={`_statement ${selected ? '_selected' : ''}`}
			style={{
				left: pos.getLeft(),
				top: pos.getTop(),
				borderColor: selected
					? SIDE_COLORS[generateNumber(statement.getNamespace() + statement.getName())]
					: '',
			}}
			id={`statement_${statement.getStatementName()}`}
		>
			<div
				className="_nameContainer"
				onMouseDown={e => {
					if (e.button !== 0) return;
					e.stopPropagation();
					e.preventDefault();
					setMouseDown(true);
				}}
				onMouseMove={nodeMouseMove}
				onMouseUp={nodeMouseMove}
				onDoubleClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				<i
					className={`_icon fa fa-solid ${
						ICONS_GROUPS.get(statement.getNamespace()) ?? 'fa-microchip'
					}`}
					style={{
						backgroundColor:
							SIDE_COLORS[
								generateNumber(statement.getNamespace() + statement.getName())
							],
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
