import React, { useState } from 'react';

interface AddComponentPanelButtonsProps {
	onComponentAdd: (type: string) => void;
	position: { line: number; top: number; left: string }; // Updated position prop
	isExpanded: boolean;
	onExpandChange: (expanded: boolean) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	styleProperties: any;
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
	position,
	isExpanded,
	onExpandChange,
	searchTerm,
	onSearchChange,
	styleProperties,
}: Readonly<AddComponentPanelButtonsProps>) {
	const [showAll, setShowAll] = useState(false);

	const filteredComponents = components.filter(comp =>
		comp.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const displayComponents = showAll ? filteredComponents : filteredComponents.slice(0, 6);
	const hasMoreComponents = filteredComponents.length > 6;

	return (
		<div
			className="_componentPanel"
			style={{
				...styleProperties.componentPanel,
				top: `${position.top}px`,
				left: position.left,
				position: 'absolute',
				display: 'inline-flex',
				alignItems: 'center',
			}}
		>
			{!isExpanded ? (
				<button
					className="_addButton"
					onClick={() => onExpandChange(!isExpanded)}
					title="Add Component"
				>
					<i className={`fa fa-${isExpanded ? 'times' : 'plus'}`}></i>
				</button>
			) : (
				<div className="_componentPopup">
					<div className="_searchContainer">
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
								onClick={() => {
									onComponentAdd(comp.syntax);
									onExpandChange(false);
									onSearchChange('');
									setShowAll(false);
								}}
								className="_componentButton"
								title={comp.name}
							>
								<span className="_componentIcon">{comp.icon}</span>
								<span className="_componentName">{comp.name}</span>
							</button>
						))}
					</div>
					{hasMoreComponents && !showAll && (
						<div className="_footer">
							<button className="_browseAll" onClick={() => setShowAll(true)}>
								Show all components
								{/* ({filteredComponents.length}) */}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
