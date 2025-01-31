import React, { useEffect, useState } from 'react';
import { PageDefinition } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';

interface TagsValueEditorProps {
	value?: { value: { [key: string]: string } };
	onChange: (value: any) => void;
	defaultValue?: { [key: string]: string };
	appPath?: string;
	pageDefinition?: PageDefinition;
	propDef: any;
	onlyValue?: boolean;
	storePaths?: Set<string>;
	onShowCodeEditor?: (eventName: string) => void;
	editPageName?: string;
	slaveStore?: any;
	pageOperations?: PageOperations;
}

export function TagsValueEditor({ value, onChange, defaultValue }: TagsValueEditorProps) {
	const [inputValue, setInputValue] = useState('');
	const [tags, setTags] = useState<string[]>([]);

	useEffect(() => {
		if (value?.value) {
			let tagArray;
			if (Array.isArray(value.value)) {
				tagArray = value.value;
			} else if (typeof value.value === 'string') {
				tagArray = (value.value as string)
					.split(/\s+/)
					.map(t => t.trim())
					.filter((t: string) => t.length > 0);
			} else if (typeof value.value === 'object') {
				tagArray = Object.values(value.value)
					.map(v => v?.toString().trim())
					.filter(v => v && v.length > 0);
			}

			setTags(tagArray as string[]);
			setInputValue('');
		} else if (defaultValue) {
			let defaultTags;
			if (Array.isArray(defaultValue)) {
				defaultTags = defaultValue;
			} else if (typeof defaultValue === 'string') {
				defaultTags = (defaultValue as string)
					.split(/\s+/)
					.map(t => t.trim())
					.filter((t: string) => t.length > 0);
			} else {
				defaultTags = Object.values(defaultValue)
					.map(v => v?.toString().trim())
					.filter(v => v && v.length > 0);
			}

			setTags(defaultTags);
			setInputValue('');
		} else {
			setTags([]);
			setInputValue('');
		}
	}, [value, defaultValue]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newInputValue = e.target.value;
		setInputValue(newInputValue);

		if (newInputValue.endsWith(' ') || newInputValue.endsWith(',')) {
			const newTags = newInputValue
				.slice(0, -1)
				.split(/[\s,]+/)
				.map(tag => tag.trim())
				.filter(tag => tag.length > 0);

			if (newTags.length > 0) {
				const uniqueTags = [...new Set([...tags, ...newTags])];
				setTags(uniqueTags);
				setInputValue('');
				onChange({ value: uniqueTags });
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if ((e.key === 'Tab' || e.key === 'Enter') && inputValue.trim()) {
			e.preventDefault();
			const newTags = [...tags, inputValue.trim()];
			setTags(newTags);
			setInputValue('');
			onChange({ value: newTags });
		} else if (
			(e.key === 'Backspace' || e.key === 'delete') &&
			!inputValue &&
			tags.length > 0
		) {
			const newTags = tags.slice(0, -1);
			setTags(newTags);
			onChange({ value: newTags.length > 0 ? newTags : undefined });
		}
	};

	const removeTag = (indexToRemove: number) => {
		const newTags = tags.filter((_, index) => index !== indexToRemove);
		setTags(newTags);
		onChange({ value: newTags.length > 0 ? newTags : undefined });
	};

	return (
		<div className="_tagsEditor">
			<div className="_tagInput">
				<div className="_tagsList">
					{tags.map((tag, index) => (
						<span key={`${tag}-${index}`} className="_tag">
							<svg
								fill="#666"
								height="12px"
								width="12px"
								viewBox="-44.27 -44.27 531.23 531.23"
								stroke="#ccc"
							>
								<g strokeLinecap="round" strokeLinejoin="round"></g>
								<g>
									<path d="M442.666,178.822l-4.004-145.078c-0.447-16.222-13.504-29.279-29.727-29.728l-145.08-4.004 c-8.475-0.237-16.493,2.97-22.468,8.945L8.954,241.391c-11.924,11.924-11.924,31.325,0,43.249l149.083,149.082 c11.951,11.953,31.296,11.956,43.25,0.001L433.721,201.29C439.636,195.374,442.897,187.184,442.666,178.822z M376.238,139.979 c-20.323,20.322-53.215,20.324-73.539,0c-20.275-20.275-20.275-53.265,0-73.539c20.323-20.323,53.215-20.324,73.539,0 C396.512,86.714,396.512,119.704,376.238,139.979z"></path>
								</g>
							</svg>
							{tag}
							<span
								className="_clearText _rightIcon fa fa-regular fa-circle-xmark fa-fw"
								onClick={() => removeTag(index)}
								title="Remove this Tag"
							/>
						</span>
					))}
				</div>
			</div>
			<div className="_peInput">
				<input
					type="text"
					className="_peInput"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={tags.length === 0 ? 'Enter tags separated by space' : ''}
				/>
			</div>
		</div>
	);
}
