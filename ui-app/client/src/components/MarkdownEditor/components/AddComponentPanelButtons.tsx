import React, { useState } from 'react';

interface AddComponentPanelButtonsProps {
	onComponentAdd: (type: string) => void;
	position: { line: number; top: number };
	isExpanded: boolean;
	onExpandChange: (expanded: boolean) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	styleProperties: any;
}

const components = [
	{ id: 'paragraph', name: 'Paragraph', icon: '¶', syntax: 'some content here' },
	{ id: 'quote', name: 'Quote', icon: '"', syntax: '> here is a quote' },
	{ id: 'pullquote', name: 'Pullquote', icon: '❝', syntax: '>>> Pull quote here' },
	{ id: 'h1', name: 'Heading 1', icon: 'H1', syntax: '# heading 1' },
	{ id: 'h2', name: 'Heading 2', icon: 'H2', syntax: '## heading 2' },
	{ id: 'h3', name: 'Heading 3', icon: 'H3', syntax: '### heading 3' },
	{ id: 'h4', name: 'Heading 4', icon: 'H4', syntax: '#### heading 4' },
	{ id: 'h5', name: 'Heading 5', icon: 'H5', syntax: '##### heading 5' },
	{ id: 'h6', name: 'Heading 6', icon: 'H6', syntax: '###### heading 6' },
	{ id: 'ul', name: 'Bullet List', icon: '•', syntax: '- add the list here\n -' },
	{ id: 'ol', name: 'Numbered List', icon: '1.', syntax: '1. add the list here' },
	{ id: 'code', name: 'Code Block', icon: '<>', syntax: '```\n' },
	{
		id: 'table',
		name: 'Table',
		icon: '▦',
		syntax: '| Header | Header |\n|---------|----------|\n| Cell | Cell |',
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
	const filteredComponents = components.filter(comp =>
		comp.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div
			className="_componentPanel"
			style={{
				...styleProperties.componentPanel,
				top: `${position.top}px`,
				position: 'absolute',
				right: '10px',
				display: 'inline-flex',
				alignItems: 'center',
				// transform: 'translateX(-100%)',
				// marginLeft: '10px',
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
						{filteredComponents.map(comp => (
							<button
								key={comp.id}
								onClick={() => {
									onComponentAdd(comp.syntax);
									onExpandChange(false);
									onSearchChange('');
								}}
								className="_componentButton"
								title={comp.name}
							>
								<span className="_componentIcon">{comp.icon}</span>
								<span className="_componentName">{comp.name}</span>
							</button>
						))}
					</div>
					<div className="_footer">
						<button className="_browseAll" onClick={() => onSearchChange('')}>
							Browse all
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
