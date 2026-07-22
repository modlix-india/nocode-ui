import { Repository, Schema } from '@fincity/kirun-js';
import React, { useEffect, useRef, useState } from 'react';

const MAX_SUGGESTIONS = 50;

export default function RefPicker({
	value,
	onChange,
	schemaRepository,
	readOnly = false,
}: Readonly<{
	value: string | undefined;
	onChange: (v: string | undefined) => void;
	schemaRepository: Repository<Schema>;
	readOnly?: boolean;
}>) {
	const [inValue, setInValue] = useState(value ?? '');
	const [suggestions, setSuggestions] = useState<string[] | undefined>();
	const requestId = useRef(0);
	const debounce = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => setInValue(value ?? ''), [value]);
	useEffect(() => () => clearTimeout(debounce.current), []);

	const search = (text: string) => {
		clearTimeout(debounce.current);
		debounce.current = setTimeout(async () => {
			const id = ++requestId.current;
			const names = await schemaRepository.filter(text).catch(() => []);
			if (id === requestId.current) setSuggestions(names.slice(0, MAX_SUGGESTIONS));
		}, 250);
	};

	const commit = (v: string) => {
		setSuggestions(undefined);
		const trimmed = v.trim();
		if (trimmed === (value ?? '')) return;
		onChange(trimmed === '' ? undefined : trimmed);
	};

	const list = suggestions?.length ? (
		<div className="_refPickerList">
			{suggestions.map(name => (
				<button
					key={name}
					className="_refPickerItem"
					onMouseDown={e => {
						e.preventDefault();
						setInValue(name);
						commit(name);
					}}
				>
					{name}
				</button>
			))}
		</div>
	) : undefined;

	return (
		<div className="_refPicker">
			<input
				type="text"
				value={inValue}
				placeholder="Search schemas or type a full name"
				disabled={readOnly}
				onFocus={() => search(inValue)}
				onChange={e => {
					setInValue(e.target.value);
					search(e.target.value);
				}}
				onKeyDown={e => {
					if (e.key === 'Escape') {
						setInValue(value ?? '');
						setSuggestions(undefined);
					} else if (e.key === 'Enter') commit(inValue);
				}}
				onBlur={() => commit(inValue)}
			/>
			{value && !readOnly && (
				<i
					className="fa fa-solid fa-xmark _clearRef"
					title="Clear reference"
					onMouseDown={e => {
						e.preventDefault();
						setInValue('');
						onChange(undefined);
					}}
				/>
			)}
			{list}
		</div>
	);
}
