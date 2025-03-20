import React, { useState, useRef, useEffect } from 'react';
import { cyrb53 } from '../../util/cyrb53';

interface EditBoxProps {
	children: React.ReactNode;
	originalContent: string;
	lineIndex: number;
	onContentChange: (newContent: string, lineIndex: number) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	onAddComponent?: (afterLineIndex: number) => void;
	isEmpty?: boolean;
}

export const EditBox: React.FC<EditBoxProps> = ({
	children,
	originalContent,
	lineIndex,
	onContentChange,
	onFocus,
	onBlur,
	onAddComponent,
	isEmpty = false,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(originalContent);
	const editRef = useRef<HTMLDivElement>(null);

	// Update content when originalContent changes
	useEffect(() => {
		setContent(originalContent);
	}, [originalContent]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isEditing) {
			setIsEditing(true);
			if (onFocus) onFocus();
		}
	};

	const handleBlur = () => {
		setIsEditing(false);
		onContentChange(content, lineIndex);
		if (onBlur) onBlur();
	};

	const handleKeyDown = (ev: React.KeyboardEvent) => {
		if (ev.key === 'Enter' && !ev.shiftKey) {
			ev.preventDefault();
			handleBlur();
			return;
		}

		if (ev.key === 'Escape') {
			ev.preventDefault();
			setContent(originalContent); // Revert changes
			setIsEditing(false);
			if (onBlur) onBlur();
			return;
		}
	};

	// Initialize the editable div with content when it first becomes editable
	useEffect(() => {
		if (isEditing && editRef.current) {
			// Set the inner HTML directly once when entering edit mode
			editRef.current.innerHTML = content;
			editRef.current.focus();

			// Place cursor at the end
			const range = document.createRange();
			const selection = window.getSelection();
			range.selectNodeContents(editRef.current);
			range.collapse(false); // collapse to end
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}, [isEditing]);

	// Handle input changes
	const handleInput = () => {
		if (editRef.current) {
			setContent(editRef.current.innerHTML);
		}
	};

	// Handle add component button click
	const handleAddComponent = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onAddComponent) {
			onAddComponent(lineIndex);
		}
	};

	return (
		<div className="_editBoxContainer">
			<div className={`_editBox ${isEditing ? '_editing' : ''}`} onClick={handleClick}>
				{isEditing ? (
					<div
						ref={editRef}
						contentEditable
						suppressContentEditableWarning
						className="_editBoxContent"
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						onInput={handleInput}
					/>
				) : (
					<div className="_editBoxDisplay">
						{children}
						<div className="_editBoxControls">
							<button className="_editButton" onClick={handleClick}>
								<i className="fa fa-pencil" />
							</button>
						</div>
					</div>
				)}
			</div>
			{onAddComponent && (
				<div className="_addComponentButtonContainer">
					<button className="_addComponentButton" onClick={handleAddComponent}>
						<i className="fa fa-plus"></i>
					</button>
				</div>
			)}
		</div>
	);
};
