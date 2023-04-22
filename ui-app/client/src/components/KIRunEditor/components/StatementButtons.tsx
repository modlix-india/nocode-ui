import React from 'react';
import { COPY_STMT_KEY } from '../../../constants';

interface StatementButtonsProps {
	selected: boolean;
	highlightColor: string;
	setEditParameters: (v: boolean) => void;
	setEditComment: (v: boolean) => void;
	statementName: string;
	onDelete: (statementName: string) => void;
	statement: any;
}

export default function StatementButtons({
	selected,
	highlightColor,
	setEditParameters,
	setEditComment,
	statementName,
	onDelete,
	statement,
}: StatementButtonsProps) {
	if (!selected) return <></>;

	return (
		<div className="_buttons" style={{ color: highlightColor }}>
			<i
				className="fa fa-solid fa-table-list"
				title={`Edit Parameters`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					setEditParameters(true);
				}}
			></i>
			<div className="_buttonsGap"></div>
			<i
				className="fa fa-regular fa-comment-dots"
				title={`Comment`}
				onMouseDown={e => {
					e.stopPropagation();
					e.preventDefault();
					setEditComment(true);
				}}
			></i>
			<div className="_buttonsGap"></div>
			<i
				className="fa fa-regular fa-trash-can"
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
