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
		</div>
	);
}
