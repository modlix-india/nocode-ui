import React from 'react';

interface ActionButtonsProps {
	text: string;
	onExport: (type: 'md' | 'html' | 'pdf') => void;
	showExportOptions: boolean;
	setShowExportOptions: (show: boolean) => void;
}

export function ActionButtons({
	text,
	onExport,
	showExportOptions,
	setShowExportOptions,
}: ActionButtonsProps) {
	return (
		<div className="_actionButtons">
			<button
				className="_actionButton"
				onClick={() => {
					const tempTextArea = document.createElement('textarea');
					tempTextArea.value = text;
					document.body.appendChild(tempTextArea);
					tempTextArea.select();
					navigator.clipboard.writeText(tempTextArea.value);
					document.body.removeChild(tempTextArea);
				}}
				title="Copy Markdown"
			>
				<i className="fa fa-copy" />
			</button>
			<div className="_exportDropdown">
				<button
					className="_actionButton"
					onClick={() => setShowExportOptions(!showExportOptions)}
					title="Export"
				>
					<i className="fa fa-download" />
				</button>
				{showExportOptions && (
					<div className="_exportOptions">
						<button onClick={() => onExport('md')}>Markdown (.md)</button>
						<button onClick={() => onExport('html')}>HTML (.html)</button>
						<button onClick={() => onExport('pdf')}>PDF (.pdf)</button>
					</div>
				)}
			</div>
		</div>
	);
}
