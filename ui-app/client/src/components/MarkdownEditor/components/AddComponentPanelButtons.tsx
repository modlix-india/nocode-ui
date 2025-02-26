import React, { useState, useRef, useEffect } from 'react';
import { FileBrowser } from '../../../commonComponents/FileBrowser';

interface AddComponentPanelButtonsProps {
	onComponentAdd: (type: string) => void;
	isExpanded: boolean;
	onExpandChange: (expanded: boolean) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	styleProperties: any;
	textAreaRef?: React.RefObject<HTMLTextAreaElement>; // Add this prop
}

const components = [
	{ id: 'paragraph', name: 'Paragraph', icon: '¶', syntax: 'some content here' },
	{ id: 'bold', name: 'Bold', icon: '**', syntax: '**bold text**' },
	{ id: 'italic', name: 'Italic', icon: '_', syntax: '*italic text*' },
	{ id: 'strikethrough', name: 'Strikethrough', icon: '~~', syntax: '~~strikethrough text~~' },
	{ id: 'ul', name: 'Bullet List', icon: '•', syntax: '- add the list here\n -' },
	{ id: 'ol', name: 'Numbered List', icon: '1.', syntax: '1. add the list here' },
	{ id: 'blockquote', name: 'Block Quote', icon: '"', syntax: '> here is a quote' },
	{ id: 'pullquote', name: 'Pullquote', icon: '❝', syntax: '>>> Pull quote here' },
	{ id: 'img', name: 'Image', icon: '🖼', syntax: '![image](image.jpg)' },
	{ id: 'h1', name: 'Heading 1', icon: 'H1', syntax: '# heading 1' },
	{ id: 'h2', name: 'Heading 2', icon: 'H2', syntax: '## heading 2' },
	{ id: 'h3', name: 'Heading 3', icon: 'H3', syntax: '### heading 3' },
	{ id: 'h4', name: 'Heading 4', icon: 'H4', syntax: '#### heading 4' },
	{ id: 'h5', name: 'Heading 5', icon: 'H5', syntax: '##### heading 5' },
	{ id: 'h6', name: 'Heading 6', icon: 'H6', syntax: '###### heading 6' },
	// { id: 'hr', name: 'Horizontal Rule', icon: '---', syntax: '---' },//not working
	{ id: 'code', name: 'Code Block', icon: '<>', syntax: '```\n' },
	{ id: 'link', name: 'Link', icon: '🔗', syntax: '[link](URL_ADDRESS.com)' },
	{ id: 'inlineCode', name: 'Inline Code', icon: '`', syntax: '`inline code`' },
	{ id: 'superscript', name: 'Superscript', icon: '⁴', syntax: 'text^superscript^' },
	{ id: 'subscript', name: 'Subscript', icon: '₄', syntax: 'text~subscript~' },
	{ id: 'highlight', name: 'Highlight', icon: '==', syntax: '==highlighted text==' },
	{
		id: 'table',
		name: 'Table',
		icon: '▦',
		syntax: "| Syntax      | Description | Test Text     |\n| :---        |    :----:   |          ---: |\n| Header      | Title       | Here's this   |\n| Paragraph   | Text        | And more      |\n",
	},
	{
		id: 'taskList',
		name: 'Task List',
		icon: '☐',
		syntax: '- [ ] Task to do\n- [x] Completed task',
	},
	{ id: 'definition', name: 'Definition', icon: '📚', syntax: 'Term\n: Definition' },
	{
		id: 'footnote',
		name: 'Footnote',
		icon: '†',
		syntax: 'Text with footnote[^1]\n\n[^1]: Footnote content',
	},
];

export function AddComponentPanelButtons({
	onComponentAdd,
	isExpanded,
	onExpandChange,
	searchTerm,
	onSearchChange,
	styleProperties,
	textAreaRef,
}: Readonly<AddComponentPanelButtonsProps>) {
	const [showAll, setShowAll] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const [showImageBrowser, setShowImageBrowser] = useState(false);
	const [showLinkDialog, setShowLinkDialog] = useState(false);
	const [linkText, setLinkText] = useState('');
	const [linkUrl, setLinkUrl] = useState('');

	const handleComponentClick = (comp: any) => {
		if (comp.id === 'img') {
			setShowImageBrowser(true);
		} else if (comp.id === 'link') {
			setShowLinkDialog(true);
			setLinkText('');
			setLinkUrl('');
		} else {
			onComponentAdd(comp.syntax);
			onExpandChange(false);
			onSearchChange('');
			setShowAll(false);
		}
	};

	const handleLinkAdd = () => {
		onComponentAdd(`[${linkText}](${linkUrl})`);
		setShowLinkDialog(false);
		onExpandChange(false);
		onSearchChange('');
		setShowAll(false);
	};

	let linkDialog = undefined;
	if (showLinkDialog) {
		linkDialog = (
			<div
				className="_popupBackground"
				onClick={e => {
					if (e.target === e.currentTarget) setShowLinkDialog(false);
				}}
			>
				<div className="_linkDialog">
					<input
						type="text"
						className="_linkInput"
						placeholder="Link text"
						value={linkText}
						onChange={e => setLinkText(e.target.value)}
					/>
					<input
						type="text"
						className="_linkInput"
						placeholder="URL"
						value={linkUrl}
						onChange={e => setLinkUrl(e.target.value)}
					/>
					<div className="_dialogButtons">
						<button
							className="_button _cancelButton"
							onClick={() => setShowLinkDialog(false)}
						>
							Cancel
						</button>
						<button
							className="_button _addButton"
							onClick={handleLinkAdd}
							disabled={!linkText || !linkUrl}
						>
							Add Link
						</button>
					</div>
				</div>
			</div>
		);
	}

	let imageBrowser = undefined;
	if (showImageBrowser) {
		imageBrowser = (
			<div
				className="_popupBackground"
				onClick={e => {
					if (e.target === e.currentTarget) setShowImageBrowser(false);
				}}
			>
				<div className="_popupContainer">
					<FileBrowser
						selectedFile=""
						onChange={file => {
							onComponentAdd(`![image](${file})`);
							setShowImageBrowser(false);
							onExpandChange(false);
							onSearchChange('');
							setShowAll(false);
						}}
						editOnUpload={false}
					/>
				</div>
			</div>
		);
	}

	const filteredComponents = components.filter(comp =>
		comp.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
				onExpandChange(false);
			}
		};

		if (isExpanded) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isExpanded]);

	const displayComponents = showAll ? filteredComponents : filteredComponents.slice(0, 6);
	const hasMoreComponents = filteredComponents.length > 6;

	return (
		<div className="_componentPanel" ref={panelRef}>
			{!isExpanded ? (
				<button
					className="_addButton"
					onClick={() => onExpandChange(!isExpanded)}
					title="Add Component ( ctrl/cmd + / )"
				>
					<i className={`fa fa-${isExpanded ? 'times' : 'plus'}`} />
				</button>
			) : (
				<div className="_componentPopup">
					<div className="_searchContainer">
						<button
							className="_closeaddButton"
							onClick={() => onExpandChange(!isExpanded)}
							title="Close add Component ( ctrl/cmd + / )"
						>
							<i className={`fa fa-${isExpanded ? 'times' : 'plus'}`} />
						</button>
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={e => onSearchChange(e.target.value)}
							className="_searchInput"
						/>
					</div>
					<div className="_componentGrid">
						{displayComponents.map(comp => (
							<button
								key={comp.id}
								onClick={() => handleComponentClick(comp)}
								className="_componentButton"
								title={comp.name}
							>
								<span className="_componentIcon">{comp.icon}</span>
								<span className="_componentName">{comp.name}</span>
							</button>
						))}
					</div>
					{imageBrowser}
					{linkDialog}
					{hasMoreComponents && !showAll && (
						<div className="_footer">
							<button className="_browseAll" onClick={() => setShowAll(true)}>
								Show all components
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
