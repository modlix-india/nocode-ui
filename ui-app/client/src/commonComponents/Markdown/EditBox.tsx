import React, { useState, useRef, useEffect } from 'react';
// import { cyrb53 } from '../../util/cyrb53';
import { FilterPanelButtons } from '../../components/MarkdownEditor/components/FilterPanelButtons';
import { AddComponentPanelButtons } from '../../components/MarkdownEditor/components/AddComponentPanelButtons';
import { useMarkdownFormatting } from '../../components/MarkdownEditor/hooks/useMarkdownFormatting';
import { useDocumentMode } from '../../components/MarkdownEditor/hooks/useDocumentMode';

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
	const [selectionRange, setSelectionRange] = useState<{ start: number; end: number }>({
		start: 0,
		end: 0,
	});

	const editRef = useRef<HTMLDivElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	const addButtonRef = useRef<HTMLButtonElement>(null);
	const addPanelRef = useRef<HTMLDivElement>(null);

	const { formatText } = useMarkdownFormatting();
	const { markdownToEditableContent, editableContentToMarkdown } = useDocumentMode();

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
			setFilterPanelPosition({
				top: 0,
				left: 0,
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
		if (isEditing) {
			setIsEditing(false);
			if (editRef.current) {
				// Convert HTML content back to markdown before saving
				const htmlContent = editRef.current.innerHTML;
				const markdownContent = editableContentToMarkdown(htmlContent);

				if (markdownContent !== originalContent) {
					setContent(markdownContent);
					onContentChange(markdownContent, lineIndex);
				}
			}
			setSelectedText('');
			if (onBlur) onBlur();
		}
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

		// Add keyboard shortcuts for formatting
		const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);
		const modifier = isMac ? ev.metaKey : ev.ctrlKey;

		if (modifier) {
			switch (ev.key.toLowerCase()) {
				case 'b':
					ev.preventDefault();
					handleFormatClick('bold');
					break;
				case 'i':
					ev.preventDefault();
					handleFormatClick('italic');
					break;
				case '[':
					ev.preventDefault();
					handleFormatClick('indent');
					break;
				case ']':
					ev.preventDefault();
					handleFormatClick('unindent');
					break;
			}
		}
	};

	// Track text selection for formatting
	const handleSelectionChange = () => {
		if (isEditing && editRef.current) {
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);

				// Check if selection is within our editable div
				if (editRef.current.contains(range.commonAncestorContainer)) {
					const selectedContent = selection.toString();
					setSelectedText(selectedContent);

					// Calculate selection start and end positions
					const start = getTextOffset(
						editRef.current,
						range.startContainer,
						range.startOffset,
					);
					const end = start + selectedContent.length;

					setSelectionRange({ start, end });
				}
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
			// Convert markdown to HTML for rich editing
			const htmlContent = markdownToEditableContent(content);

			// Set the inner HTML directly once when entering edit mode
			if (editRef.current.innerHTML !== htmlContent) {
				editRef.current.innerHTML = htmlContent;
			}
			editRef.current.focus();

			// Place cursor at the end
			const range = document.createRange();
			const selection = window.getSelection();
			range.selectNodeContents(editRef.current);
			range.collapse(false); // collapse to end
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}, [isEditing, content, markdownToEditableContent]);

	// Handle input changes - make sure we're not causing duplicate updates
	const handleInput = () => {
		if (editRef.current && isEditing) {
			// We don't update content state here as we'll convert back to markdown on blur
			// This allows the rich text to remain as HTML while editing
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

	// Helper function to get text offset in contentEditable
	const getTextOffset = (parent: Node, node: Node, offset: number): number => {
		let totalOffset = 0;

		// Handle text nodes
		if (node.nodeType === Node.TEXT_NODE) {
			// Create a TreeWalker to iterate through all text nodes
			const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);

			let currentNode = walker.nextNode();
			while (currentNode && currentNode !== node) {
				totalOffset += currentNode.textContent?.length ?? 0;
				currentNode = walker.nextNode();
			}

			return totalOffset + offset;
		}
		// Handle element nodes
		else if (node.nodeType === Node.ELEMENT_NODE) {
			// If we're at an element node, count all text before this element
			const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);

			let textBefore = 0;
			let currentNode = walker.nextNode();

			while (currentNode) {
				// Check if this text node is before our target in the DOM
				if (node.compareDocumentPosition(currentNode) & Node.DOCUMENT_POSITION_PRECEDING) {
					textBefore += currentNode.textContent?.length ?? 0;
				}
				currentNode = walker.nextNode();
			}

			return textBefore + offset;
		}

		return offset;
	};

	// Handle formatting from filter panel
	// Handle dropdown item click
	const handleFormatClick = (command: string, value?: string | { url: string; text: string }) => {
		if (!editRef.current || !isEditing) return;

		// Get current selection
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		// Apply formatting directly using document.execCommand for rich text editing
		switch (command) {
			case 'bold':
				document.execCommand('bold', false);
				break;
			case 'italic':
				document.execCommand('italic', false);
				break;
			case 'strikethrough':
				document.execCommand('strikeThrough', false);
				break;
			case 'heading1':
				// Replace current selection with h1 element
				wrapSelectionWithTag('h1');
				break;
			case 'heading2':
				wrapSelectionWithTag('h2');
				break;
			case 'heading3':
				wrapSelectionWithTag('h3');
				break;
			case 'heading4':
				wrapSelectionWithTag('h4');
				break;
			case 'heading5':
				wrapSelectionWithTag('h5');
				break;
			case 'heading6':
				wrapSelectionWithTag('h6');
				break;
			case 'alignLeft':
				document.execCommand('justifyLeft', false);
				break;
			case 'alignCenter':
				document.execCommand('justifyCenter', false);
				break;
			case 'alignRight':
				document.execCommand('justifyRight', false);
				break;
			case 'alignJustify':
				document.execCommand('justifyFull', false);
				break;
			case 'orderedList':
				document.execCommand('insertOrderedList', false);
				break;
			case 'list':
				document.execCommand('insertUnorderedList', false);
				break;
			case 'link':
				if (value && typeof value !== 'string') {
					const { url, text } = value;
					document.execCommand('createLink', false, url);
				}
				break;
			case 'inlineCode':
				wrapSelectionWithTag('code');
				break;
			case 'quote':
				wrapSelectionWithTag('blockquote');
				break;
			case 'highlight':
				wrapSelectionWithTag('mark');
				break;
			default:
				const currentMarkdown = editableContentToMarkdown(editRef.current.innerHTML);
				const { newText } = formatText(currentMarkdown, command, selectionRange, value);
				editRef.current.innerHTML = markdownToEditableContent(newText);
				break;
		}

		// Ensure focus remains on the editor
		editRef.current.focus();
	};

	// Helper function to wrap selection with HTML tag
	const wrapSelectionWithTag = (tagName: string) => {
		if (!editRef.current) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const selectedContent = range.extractContents();
		const newElement = document.createElement(tagName);

		newElement.appendChild(selectedContent);
		range.insertNode(newElement);

		// Reset selection
		selection.removeAllRanges();
		selection.addRange(range);
	};

	return (
		<div className="_editBoxContainer">
			{isEditing && (
				<div
					className="_filterPanelContainer"
					style={{
						position: 'absolute',
						top: '-40px',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 1000,
						display: 'flex',
						justifyContent: 'center',
						backgroundColor: 'white',
						borderRadius: '4px',
						boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
						padding: '8px 8px',
					}}
				>
					<FilterPanelButtons
						onFormatClick={handleFormatClick}
						isVisible={true}
						styleProperties={{}}
						selectedText={selectedText}
						isFloating={true}
						position={{ x: 0, y: 0 }}
					/>
				</div>
			)}

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
						className="_editBoxContent _richTextEditor"
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						onInput={handleInput}
					/>
				) : (
					<>
						{children}
						<div className="_editBoxControls">
							<button className="_editButton" onClick={handleClick}>
								<svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
					</>
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
