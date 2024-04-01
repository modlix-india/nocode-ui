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
	const [open, setOpen] = useState<boolean>(false);
	const [currentOption, setCurrentOption] = useState(-1);

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
			<div
				className="_tagInputContainer"
				// onBlur={() => setOpen(false)}
				onFocus={() => setOpen(true)}
			>
				<input
					className="_peInput"
					type="text"
					value={chngValue}
					placeholder={showPlaceholder ? propDef.defaultValue : undefined}
					onChange={e => {
						setChngValue(e.target.value);
						setOpen(true);
					}}
					onKeyDown={e => {
						if (e.key === 'ArrowUp') {
							e.preventDefault();
							e.stopPropagation();
							if (!tagsList[currentOption]) return;
							setCurrentOption(
								(tagsList.length + currentOption - 1) % tagsList.length,
							);
							if (!open) setOpen(true);
						} else if (e.key === 'ArrowDown') {
							e.preventDefault();
							e.stopPropagation();
							if (!tagsList) return;
							setCurrentOption((currentOption + 1) % tagsList.length);
							if (!open) setOpen(true);
						} else if (e.key === 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							console.log('enter2');
							if (!tagsList?.[currentOption]) return;
							onChange({
								...value,
								value:
									tagsList[currentOption] === '' ||
									tagsList[currentOption] === propDef.defaultValue
										? undefined
										: tagsList[currentOption],
							});
							setOpen(false);
						} else if (e.key === 'Escape') {
							e.preventDefault();
							e.stopPropagation();
							setOpen(false);
							setChngValue(value?.value ?? '');
						}
					}}
				/>
				{open && tagsList && tagsList.length > 0 && (
					<div className="_tagOptionContainer">
						{tagsList.map((tag, index) => (
							<div
								key={tag}
								title={tag}
								className={`_tagOption ${currentOption === index && '_hovered'}`}
								onClick={() => {
									onChange({
										...value,
										value:
											tag === '' || tag === propDef.defaultValue
												? undefined
												: tag,
									});
								}}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										console.log('enter');
										e.preventDefault();
										e.stopPropagation();
										if (!tagsList?.[currentOption]) return;
										onChange({
											...value,
											value:
												tag === '' || tag === propDef.defaultValue
													? undefined
													: tag,
										});
										setOpen(false);
									}
								}}
								onMouseOver={() => setCurrentOption(index)}
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
