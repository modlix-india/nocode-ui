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
			<div className="_tagInputContainer">
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
					<div className="_tagOptionContainer">
						{tagsList.map(tag => (
							<div
								key={tag}
								className="_tagOption"
								onClick={e => {
									onChange({
										...value,
										value:
											tag === '' || tag === propDef.defaultValue
												? undefined
												: tag,
									});
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
