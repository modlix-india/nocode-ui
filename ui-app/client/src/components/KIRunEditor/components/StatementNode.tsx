import {
	Event,
	Function,
	Position,
	Repository,
	Schema,
	Statement,
	TokenValueExtractor,
	isNullValue,
} from '@fincity/kirun-js';
import React, { RefObject, useCallback, useEffect, useState } from 'react';
import duplicate from '../../../util/duplicate';
import Search from './Search';
import { COPY_STMT_KEY } from '../../../constants';
import { generateColor } from '../colors';

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
	executionPlanMessage?: string[];
	onChange: (statement: any) => void;
	functionNames: string[];
	onDelete: (statementName: string) => void;
	onDependencyDragStart: (ddPos: any) => void;
	onDependencyDrop: (statement: string) => void;
	showComment: boolean;
}

const DEFAULT_POSITION = { left: 0, top: 0 };

const VARIBALE_NAME_REGEX = /^[A-Za-z_]{1,1}[_A-Za-z0-9]+$/;

export default function StatementNode({
	position = DEFAULT_POSITION,
	statement,
	functionRepository,
	onDragStart,
	onClick,
	selected = false,
	container,
	dragNode,
	executionPlanMessage,
	onChange,
	functionNames,
	onDelete,
	onDependencyDragStart,
	onDependencyDrop,
	showComment,
}: StatementProps) {
	const [statementName, setStatementName] = useState(statement.statementName);
	const [editStatementName, setEditStatementName] = useState(false);
	const [editNameNamespace, setEditNameNamespace] = useState(false);
	const [validationMessages, setValidationMessages] = useState<Map<string, string>>(new Map());
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

	useEffect(() => {
		const map = new Map();
		if (!VARIBALE_NAME_REGEX.test(statementName)) {
			map.set(
				'statementName',
				'Step name cannot have spaces or special characters and should be atleast one character.',
			);
		}
		if (!functionRepository.find(statement.namespace, statement.name)) {
			map.set('function', 'Function does not exist.');
		}
		setValidationMessages(map);
	}, [statementName, name, statement]);

	const [mouseMove, setMouseMove] = useState(false);
	const alwaysColor =
		validationMessages.size > 0 || executionPlanMessage?.length
			? '#f25332'
			: `#${generateColor(statement.namespace, statement.name)}`;

	const highlightColor =
		validationMessages.size > 0 || executionPlanMessage?.length
			? '#f25332'
			: selected
			? alwaysColor
			: '';

	const [editComment, setEditComment] = useState(false);

	const buttons = selected ? (
		<div className="_buttons" style={{ color: highlightColor }}>
			<i
				className="fa fa-regular fa-trash-can"
				title={`Delete ${statementName}`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					onDelete(statement.statementName);
				}}
			></i>
			<i
				className="fa fa-regular fa-clipboard"
				title={`Copy ${statementName}`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();

					if (!navigator.clipboard) return;

					navigator.clipboard.write([
						new ClipboardItem({
							'text/plain': new Blob([COPY_STMT_KEY + JSON.stringify(statement)], {
								type: 'text/plain',
							}),
						}),
					]);
				}}
			></i>
			<i
				className="fa fa-regular fa-comment-dots"
				title={`Comment ${statementName}`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					setEditComment(true);
				}}
			></i>
		</div>
	) : (
		<></>
	);

	const repoFunction = functionRepository.find(statement.namespace, statement.name);

	const parameters = repoFunction?.getSignature()?.getParameters()
		? Array.from(repoFunction.getSignature().getParameters().values())
		: [];

	let eventsMap = repoFunction?.getSignature()?.getEvents();
	if (!eventsMap || !eventsMap.get(Event.OUTPUT)) {
		if (!eventsMap) eventsMap = new Map();
		eventsMap.set(Event.OUTPUT, new Event(Event.OUTPUT, new Map()));
	}

	const events = Array.from(eventsMap.values());

	const params = parameters.length ? (
		<div className="_paramsContainer">
			<div className="_paramHeader">Parameters</div>
			{parameters.map(e => {
				const paramValue = statement.parameterMap?.[e.getParameterName()];
				const hasValue = paramValue && Object.values(paramValue).length;
				const title = stringValue(paramValue);
				return (
					<div className="_param" key={e.getParameterName()}>
						<div
							id={`paramNode_${statement.statementName}_${e.getParameterName()}`}
							className="_paramNode"
							style={{ borderColor: alwaysColor }}
						></div>
						<div className={`_paramName ${hasValue ? '_hasValue' : ''}`} title={title}>
							{e.getParameterName()}
						</div>
					</div>
				);
			})}
		</div>
	) : (
		<></>
	);

	const dependcyNode = (
		<div
			className="_dependencyNode"
			id={`eventNode_dependentNode_${statement.statementName}`}
			style={{ borderColor: alwaysColor }}
			title="Depends on"
		></div>
	);

	const eventsDiv = events.length ? (
		events.map(e => {
			const eventParams = Array.from(e.getParameters()?.entries() ?? []);
			return (
				<div className="_paramsContainer _event" key={e.getName()}>
					<div className="_paramHeader">{e.getName()}</div>
					<div
						id={`eventNode_${statement.statementName}_${e.getName()}`}
						className="_paramNode _eventNode"
						style={{ borderColor: alwaysColor }}
						onMouseDown={ev => {
							ev.stopPropagation();
							ev.preventDefault();
							const rect = container.current!.getBoundingClientRect();
							const tRect = ev.currentTarget.getBoundingClientRect();
							const left = Math.round(
								tRect.left - rect.left + container.current!.scrollLeft,
							);
							const top = Math.round(
								tRect.top - rect.top + container.current!.scrollTop,
							);
							onDependencyDragStart({
								left,
								top,
								dependency: `Steps.${statement.statementName}.${e.getName()}`,
							});
						}}
					></div>
					{eventParams.map(([pname]) => {
						return (
							<div className="_param" key={pname}>
								<div
									id={`eventParameter_${
										statement.statementName
									}_${e.getName()}_${pname}`}
									className="_paramNode"
									style={{ borderColor: alwaysColor }}
									onMouseDown={ev => {
										ev.stopPropagation();
										ev.preventDefault();
										const rect = container.current!.getBoundingClientRect();
										const tRect = ev.currentTarget.getBoundingClientRect();
										const left = Math.round(
											tRect.left - rect.left + container.current!.scrollLeft,
										);
										const top = Math.round(
											tRect.top - rect.top + container.current!.scrollTop,
										);
										onDependencyDragStart({
											left,
											top,
											dependency: `Steps.${
												statement.statementName
											}.${e.getName()}.${pname}`,
										});
									}}
								></div>
								<div className="_paramName">{pname}</div>
							</div>
						);
					})}
				</div>
			);
		})
	) : (
		<></>
	);

	const [changeComment, setChangeComment] = useState<string>(statement.comment ?? '');
	useEffect(() => setChangeComment(statement.comment), [statement.comment]);

	const comments =
		(showComment && statement.comment) || editComment ? (
			<div
				className="_commentContainer"
				onDoubleClick={e => {
					e.preventDefault();
					e.stopPropagation();
					setEditComment(true);
				}}
			>
				<span
					className="_comment"
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					{statement.comment ?? ''}
				</span>
				{editComment ? (
					<textarea
						className="_commentEditor"
						value={changeComment}
						placeholder="Add a comment"
						onKeyUp={e => {
							e.preventDefault();
							e.stopPropagation();
							if (e.key === 'Escape') {
								setEditComment(false);
								setChangeComment(statement.comment);
							}
						}}
						onBlur={() => {
							setEditComment(false);
							onChange({ ...duplicate(statement), comment: changeComment });
						}}
						onChange={e => setChangeComment(e.target.value)}
						onMouseDown={e => {
							e.stopPropagation();
						}}
						autoFocus
					/>
				) : (
					<></>
				)}
			</div>
		) : (
			<></>
		);

	return (
		<div
			className={`_statement ${selected ? '_selected' : ''}`}
			style={{
				left: position.left + (selected && dragNode ? dragNode.dLeft : 0) + 'px',
				top: position.top + (selected && dragNode ? dragNode.dTop : 0) + 'px',
				borderColor: selected ? highlightColor : '',
				zIndex: selected ? '3' : '',
			}}
			id={`statement_${statement.statementName}`}
			onClick={e => {
				e.preventDefault();
				e.stopPropagation();
				// onClick(e.ctrlKey || e.metaKey, statement.statementName);
			}}
			onMouseUp={e => {
				onDependencyDrop(statement.statementName);
			}}
			onContextMenu={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onDoubleClick={ev => {
				ev.preventDefault();
				ev.stopPropagation();
			}}
		>
			{comments}
			<div
				className="_namesContainer"
				style={{
					backgroundColor: highlightColor ? highlightColor : alwaysColor,
				}}
			>
				<div
					className="_nameContainer"
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();

						if (e.button !== 0) return;

						const rect = container.current!.getBoundingClientRect();
						const left = Math.round(
							e.clientX - rect.left + container.current!.scrollLeft,
						);
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
						onDependencyDrop(statement.statementName);

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
					></i>
					<div
						className="_statementContanier"
						style={{
							borderColor: highlightColor ? highlightColor : alwaysColor,
						}}
					>
						<div
							className={`_statementName`}
							onDoubleClick={e => {
								e.stopPropagation();
								e.preventDefault();
								setEditStatementName(true);
							}}
						>
							{editStatementName ? (
								<>
									<input
										type="text"
										value={statementName}
										onChange={e => setStatementName(e.target.value)}
										autoFocus={true}
										onBlur={() => {
											setEditStatementName(false);
											onChange({ ...duplicate(statement), statementName });
										}}
										onKeyUp={e => {
											if (e.key === 'Delete' || e.key === 'Backspace') {
												e.stopPropagation();
												e.preventDefault();
											} else if (e.key === 'Escape') {
												setStatementName(statement.statementName);
												setEditStatementName(false);
											} else if (e.key === 'Enter') {
												setEditStatementName(false);
												onChange({
													...duplicate(statement),
													statementName,
												});
											}
										}}
									/>
								</>
							) : (
								statementName
							)}
						</div>
						<i
							className="_editIcon fa fa-1x fa-solid fa-pencil"
							style={{ visibility: editStatementName ? 'visible' : undefined }}
							onClick={() => {
								setEditStatementName(true);
							}}
						/>
					</div>
				</div>
				<div className={`_nameNamespaceContainer`}>
					<div
						className={`_nameNamespace`}
						onDoubleClick={e => {
							e.stopPropagation();
							e.preventDefault();
							setEditNameNamespace(true);
							onClick(false, statement.statementName);
						}}
					>
						{editNameNamespace ? (
							<Search
								value={name}
								options={functionNames.map(e => ({
									value: e,
								}))}
								style={{
									backgroundColor: highlightColor ? highlightColor : alwaysColor,
								}}
								onChange={value => {
									const index = value.lastIndexOf('.');

									const name = index === -1 ? value : value.substring(index + 1);
									const namespace =
										index === -1 ? '_' : value.substring(0, index);
									onChange({ ...duplicate(statement), name, namespace });
									setEditNameNamespace(false);
								}}
								onClose={() => setEditNameNamespace(false)}
							/>
						) : (
							name
						)}
					</div>
					<i
						className="_editIcon fa fa-1x fa-solid fa-bars-staggered"
						style={{ visibility: editNameNamespace ? 'visible' : undefined }}
						onClick={() => {
							setEditNameNamespace(true);
							onClick(false, statement.statementName);
						}}
					/>
				</div>
			</div>
			<div className="_otherContainer">
				{params}
				<div className="_eventsContainer">{eventsDiv}</div>
			</div>
			<div className="_messages">
				{executionPlanMessage &&
					executionPlanMessage.map(value => (
						<div key={value} className="_message">
							{value}
						</div>
					))}
				{validationMessages.size > 0 &&
					Array.from(validationMessages.entries()).map(([key, value]) => (
						<div key={key} className="_message">
							{value}
						</div>
					))}
			</div>
			{buttons}
			{dependcyNode}
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
	['System.Object', 'fa-circle-dot'],
	['UIEngine', 'fa-snowflake'],
]);
function stringValue(paramValue: any) {
	if (paramValue === undefined) return undefined;
	const value = Object.values(paramValue)
		.filter(e => !isNullValue(e))
		.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
		.map((e: any) => {
			if (e.type === 'EXPRESSION') return e.expression;
			if (typeof e.value === 'object') return JSON.stringify(e.value, undefined, 2);
			return e.value;
		})
		.join('\n')
		.trim();

	return value ? value : undefined;
}
