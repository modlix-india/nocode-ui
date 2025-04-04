import React, { useState, useRef, useEffect, FC } from 'react';
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

export const EditBox: FC<EditBoxProps> = ({
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

	useEffect(() => {
		setContent(originalContent);
	}, [originalContent]);

	useEffect(() => {
		if (isEditing && boxRef.current) {
			setFilterPanelPosition({
				top: 0,
				left: 0,
			});
		}
	}, [isEditing]);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isEditing) {
			setIsEditing(true);
			if (onFocus) onFocus();
		}
	};

	const handleBlur = () => {
		if (isEditing && editRef.current) {
			const htmlContent = editRef.current.innerHTML;
			const markdownContent = editableContentToMarkdown(htmlContent);

			if (markdownContent !== originalContent) {
				setContent(markdownContent);
				onContentChange(markdownContent, lineIndex);
			}
		}
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

				if (editRef.current.contains(range.commonAncestorContainer)) {
					const selectedContent = selection.toString();
					setSelectedText(selectedContent);

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

	useEffect(() => {
		if (isEditing) {
			document.addEventListener('selectionchange', handleSelectionChange);
		}

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
		};
	}, [isEditing]);

	useEffect(() => {
		if (isEditing && editRef.current) {
			const htmlContent = markdownToEditableContent(content);

			if (editRef.current.innerHTML !== htmlContent) {
				editRef.current.innerHTML = htmlContent;
			}
			editRef.current.focus();

			const range = document.createRange();
			const selection = window.getSelection();
			range.selectNodeContents(editRef.current);
			range.collapse(false);
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}, [isEditing, content, markdownToEditableContent]);

	const handleInput = () => {
		if (editRef.current && isEditing) {
			//do nothing
		}
	};

	const handleAddComponent = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setShowAddComponentPanel(true);
	};

	const handleComponentSelect = (componentType: string) => {
		if (onAddComponent) {
			onAddComponent(lineIndex, componentType);
			setShowAddComponentPanel(false);
		}
	};

	const getTextOffset = (parent: Node, node: Node, offset: number): number => {
		let totalOffset = 0;

		if (node.nodeType === Node.TEXT_NODE) {
			const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);

			let currentNode = walker.nextNode();
			while (currentNode && currentNode !== node) {
				totalOffset += currentNode.textContent?.length ?? 0;
				currentNode = walker.nextNode();
			}

			return totalOffset + offset;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null);

			let textBefore = 0;
			let currentNode = walker.nextNode();

			while (currentNode) {
				if (node.compareDocumentPosition(currentNode) & Node.DOCUMENT_POSITION_PRECEDING) {
					textBefore += currentNode.textContent?.length ?? 0;
				}
				currentNode = walker.nextNode();
			}

			return textBefore + offset;
		}

		return offset;
	};

	const handleFormatClick = (command: string, value?: string | { url: string; text: string }) => {
		if (!editRef.current || !isEditing) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

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

		editRef.current.focus();
	};

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
