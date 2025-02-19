import React, { useState } from 'react';

interface AddComponentPanelButtonsProps {
	onComponentAdd: (type: string) => void;
	position: { line: number; top: number };
	styleProperties: any;
}

export function AddComponentPanelButtons({
	onComponentAdd,
	position,
	styleProperties,
}: Readonly<AddComponentPanelButtonsProps>) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const components = [
		{ id: 'paragraph', name: 'Paragraph', icon: '¶', syntax: '' },
		{ id: 'quote', name: 'Quote', icon: '"', syntax: '> here is a quote' },
		{ id: 'pullquote', name: 'Pullquote', icon: '❝', syntax: '>>> ' },
		{ id: 'h1', name: 'Heading 1', icon: 'H1', syntax: '# ' },
		{ id: 'h2', name: 'Heading 2', icon: 'H2', syntax: '## ' },
		{ id: 'h3', name: 'Heading 3', icon: 'H3', syntax: '### ' },
		{ id: 'ul', name: 'Bullet List', icon: '•', syntax: '- ' },
		{ id: 'ol', name: 'Numbered List', icon: '1.', syntax: '1. ' },
		{ id: 'code', name: 'Code Block', icon: '<>', syntax: '```\n' },
		{
			id: 'table',
			name: 'Table',
			icon: '▦',
			syntax: '| Header | Header |\n|---------|----------|\n| Cell | Cell |',
		},
	];

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
				left: '30px',
				display: 'block', // Make sure it's always displayed
				transform: 'translateX(-100%)',
				marginLeft: '10px',
			}}
		>
			{!isExpanded ? (
				<button
					className="_addButton"
					onClick={() => setIsExpanded(true)}
					title="Add Component"
				>
					<i className="fa fa-plus-square"></i>
				</button>
			) : (
				<div className="_componentPopup">
					<div className="_searchContainer">
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className="_searchInput"
						/>
					</div>
					<div className="_componentGrid">
						{filteredComponents.map(comp => (
							<button
								key={comp.id}
								onClick={() => {
									onComponentAdd(comp.syntax);
									setIsExpanded(false);
									setSearchTerm('');
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
						<button className="_browseAll" onClick={() => setSearchTerm('')}>
							Browse all
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
