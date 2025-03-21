import React, { useState, useRef, useEffect } from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { FilterPanelButtons } from '../../components/MarkdownEditor/components/FilterPanelButtons';
import { AddComponentPanelButtons } from '../../components/MarkdownEditor/components/AddComponentPanelButtons';
import { useMarkdownFormatting } from '../../components/MarkdownEditor/hooks/useMarkdownFormatting';

interface EditBoxProps {
	children: React.ReactNode;
	originalContent: string;
	lineIndex: number;
	onContentChange: (newContent: string, lineIndex: number) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	onAddComponent?: (afterLineIndex: number, componentType: string) => void;
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
	const [showAddComponentPanel, setShowAddComponentPanel] = useState(false);
	const [componentSearchTerm, setComponentSearchTerm] = useState('');
	const [selectedText, setSelectedText] = useState('');
	const [filterPanelPosition, setFilterPanelPosition] = useState({ top: 0, left: 0 });

	const editRef = useRef<HTMLDivElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const addButtonRef = useRef<HTMLButtonElement>(null);
	const addPanelRef = useRef<HTMLDivElement>(null);

	const { formatText } = useMarkdownFormatting();

	// Update content when originalContent changes
	useEffect(() => {
		setContent(originalContent);
	}, [originalContent]);

	// Handle click outside to close the add component panel
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				addPanelRef.current &&
				!addPanelRef.current.contains(event.target as Node) &&
				addButtonRef.current &&
				!addButtonRef.current.contains(event.target as Node)
			) {
				setShowAddComponentPanel(false);
			}
		};

		if (showAddComponentPanel) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showAddComponentPanel]);

	// Calculate filter panel position when editing starts
	useEffect(() => {
		if (isEditing && boxRef.current) {
			const rect = boxRef.current.getBoundingClientRect();
			setFilterPanelPosition({
				top: rect.top - 40, // Position above the box
				left: rect.left + rect.width / 2 - 150, // Center horizontally (assuming panel width ~300px)
			});
		}
	}, [isEditing]);

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
		setSelectedText('');
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

	// Track text selection for formatting
	const handleSelectionChange = () => {
		if (isEditing && editRef.current) {
			const selection = window.getSelection();
			if (selection && selection.toString()) {
				setSelectedText(selection.toString());
			} else {
				setSelectedText('');
			}
		}
	};

	// Add event listener for selection changes
	useEffect(() => {
		if (isEditing) {
			document.addEventListener('selectionchange', handleSelectionChange);
		}

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
		};
	}, [isEditing]);

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
		setShowAddComponentPanel(true);
	};

	// Handle component selection from the panel
	const handleComponentSelect = (componentType: string) => {
		if (onAddComponent) {
			onAddComponent(lineIndex, componentType);
			setShowAddComponentPanel(false);
		}
	};

	// Handle formatting from filter panel
	const handleFormatClick = (command: string, value?: string | { url: string; text: string }) => {
		if (editRef.current) {
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				if (
					range.commonAncestorContainer.parentElement === editRef.current ||
					range.commonAncestorContainer === editRef.current
				) {
					// Get the selected text and its position
					const selectedText = selection.toString();
					const selectionStart = getTextOffset(
						editRef.current,
						range.startContainer,
						range.startOffset,
					);
					const selectionEnd = selectionStart + selectedText.length;

					// Format the text
					const { newText } = formatText(
						content,
						command,
						{ start: selectionStart, end: selectionEnd },
						value,
					);

					// Update the content
					setContent(newText);
					editRef.current.innerHTML = newText;
				}
			}
		}
	};

	// Helper function to get text offset in contentEditable
	const getTextOffset = (parent: Node, node: Node, offset: number): number => {
		let totalOffset = 0;
		const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);

		let currentNode = walker.nextNode();
		while (currentNode && currentNode !== node) {
			totalOffset += currentNode.textContent?.length || 0;
			currentNode = walker.nextNode();
		}

		return totalOffset + offset;
	};

	return (
		<div className="_editBoxContainer">
			<div className="_editBoxContentContainer">
				{isEditing && (
					<FilterPanelButtons
						onFormatClick={handleFormatClick}
						isVisible={true}
						styleProperties={{}}
						selectedText={selectedText}
						isFloating={true}
					/>
				)}
			</div>

			<div
				className={`_editBox ${isEditing ? '_editing' : ''}`}
				onClick={handleClick}
				ref={boxRef}
			>
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
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.04913 2.25697C9.54593 1.71872 9.79433 1.4496 10.0583 1.29262C10.6951 0.91384 11.4794 0.90206 12.1269 1.26155C12.3953 1.41053 12.6513 1.67208 13.1633 2.19517C13.6754 2.71827 13.9315 2.97981 14.0773 3.25395C14.4292 3.91541 14.4177 4.71653 14.0469 5.36713C13.8932 5.63677 13.6297 5.89052 13.1029 6.398L6.83373 12.4362C5.83525 13.3979 5.336 13.8788 4.71204 14.1225C4.08808 14.3662 3.40213 14.3483 2.03024 14.3124L1.84359 14.3075C1.42594 14.2966 1.21711 14.2911 1.09573 14.1533C0.974334 14.0156 0.990907 13.8029 1.02405 13.3775L1.04205 13.1465C1.13534 11.949 1.18198 11.3503 1.41581 10.8121C1.64963 10.2739 2.05296 9.837 2.85962 8.963L9.04913 2.25697Z"
										fill="white"
										fillOpacity="0.2"
										stroke="white"
										strokeWidth="1.2"
										strokeLinejoin="round"
									/>
									<path d="M9 14.3335H14.3333H9Z" fill="black" />
									<path
										d="M9 14.3335H14.3333"
										stroke="white"
										strokeWidth="1.2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M8.33301 2.3335L12.9997 7.00016L8.33301 2.3335Z"
										fill="white"
									/>
									<path
										d="M8.33301 2.3335L12.9997 7.00016"
										stroke="white"
										strokeWidth="1.2"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</div>
					</div>
				)}
			</div>
			{onAddComponent && (
				<div className="_addComponentButtonContainer">
					<button
						className="_addComponentButton"
						onClick={handleAddComponent}
						ref={addButtonRef}
					>
						<i className="fa fa-plus"></i>
					</button>

					{showAddComponentPanel && (
						<div className="_addComponentPanel" ref={addPanelRef}>
							<AddComponentPanelButtons
								onComponentAdd={handleComponentSelect}
								isExpanded={true}
								onExpandChange={() => {}}
								searchTerm={componentSearchTerm}
								onSearchChange={setComponentSearchTerm}
								styleProperties={{}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
