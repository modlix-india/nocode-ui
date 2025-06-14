import React from 'react';
import { COPY_STMT_KEY } from '../../../constants';

interface StatementButtonsProps {
	selected: boolean;
	highlightColor: string;
	onEditParameters?: (name: string) => void;
	onEditComment: () => void;
	statementName: string;
	onDelete: (statementName: string) => void;
	statement: any;
	showEditParameters: boolean;
	editParameters?: boolean;
	onRemoveAllDependencies: () => void;
	onCopy: (statementName: string) => void;
}

export default function StatementButtons({
	selected,
	highlightColor,
	onEditComment,
	onEditParameters,
	statementName,
	onDelete,
	statement,
	showEditParameters,
	editParameters,
	onRemoveAllDependencies,
	onCopy,
}: StatementButtonsProps) {
	if (!selected) return <></>;

	const editParamsButton =
		showEditParameters && !editParameters ? (
			<>
				<i
					className="fa fa-solid fa-table-list"
					title={`Edit Parameters`}
					onMouseDown={e => {
						e.stopPropagation();
						e.preventDefault();
						onEditParameters?.(statementName);
					}}
				></i>
				<div className="_buttonsGap"></div>
			</>
		) : (
			<></>
		);

	return (
		<div className="_buttons" style={{ color: highlightColor }}>
			{editParamsButton}
			<i
				className="fa fa-regular fa-comment-dots"
				title={`Comment`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					onEditComment();
				}}
			></i>
			<div className="_buttonsGap"></div>
			<i
				className="fa fa-regular fa-trash-can _hideInEdit"
				title={`Delete ${statementName} Step`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					onDelete(statement.statementName);
				}}
			></i>
			<i
				className="fa fa-regular fa-clipboard"
				title={`Copy ${statementName} Step`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					onCopy(statementName);
				}}
			></i>
			<div className="_buttonsGap"></div>
			<i
				className="fa fa-solid fa-link-slash"
				title="Remove all dependencies"
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();

					onRemoveAllDependencies?.();
				}}
			></i>
		</div>
	);
}
