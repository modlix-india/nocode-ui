import React, { useEffect, useState } from 'react';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	PageDefinition,
} from '../../../../types/common';

interface TagEditorProperty {
	propDef: ComponentPropertyDefinition;
	showPlaceholder: boolean;
	chngValue: any;
	setChngValue: (value: any) => void;
	onChange: (v: any) => void;
	value: ComponentProperty<any> | undefined;
	pageDefinition: PageDefinition | undefined;
}

export default function TagEditor({
	propDef,
	showPlaceholder,
	chngValue,
	setChngValue,
	onChange,
	value,
	pageDefinition,
}: TagEditorProperty) {
	const [tagsList, setTagsList] = useState<string[]>([]);

	useEffect(() => {
		if (setTagsList) {
			const componentDefinitions = pageDefinition?.componentDefinition || {};
			const allTags: string[] = [];
			Object.entries(componentDefinitions).map(entry => {
				const tagsProperties = entry[1]?.properties?._tags;
				if (Array.isArray(tagsProperties)) {
					tagsProperties.forEach(tag => {
						!allTags.includes(tag) &&
							chngValue &&
							tag.includes(chngValue) &&
							allTags.push(tag);
					});
				}
			});
			setTagsList(allTags);
		}
	}, [chngValue]);

	return (
		<>
			<div style={{ width: '100%', display: 'flex' }}>
				<input
					className="_peInput"
					type="text"
					value={chngValue}
					placeholder={showPlaceholder ? propDef.defaultValue : undefined}
					onChange={e => {
						setChngValue(e.target.value);
					}}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							onChange({
								...value,
								value:
									chngValue === '' || chngValue === propDef.defaultValue
										? undefined
										: chngValue,
							});
						} else if (e.key === 'Escape') {
							setChngValue(value?.value ?? '');
						}
					}}
				/>
				{tagsList && tagsList.length > 0 && (
					<div
						style={{
							position: 'absolute',
							top: 'calc(100% - 10px)',
							width: '259px',
							backgroundColor: '#FFF',
							border: '1px solid rgba(0, 0, 0, 0.10)',
							zIndex: '2',
							boxShadow: '0px 1px 4px 0px #00000026',
							borderRadius: '6px',
							marginTop: '4px',
							maxHeight: '250px',
							overflow: 'auto',
						}}
					>
						{tagsList.map(tag => (
							<div
								key={tag}
								style={{
									width: '100%',
									padding: '10px',
									fontSize: '14px',
									color: 'rgba(0,0,0,0.7)',
									cursor: 'pointer',
								}}
								onClick={e => {
									setChngValue(tag);
								}}
							>
								{tag}
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}
