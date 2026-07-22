import { Schema } from '@fincity/kirun-js';
import React, { useEffect, useRef, useState } from 'react';

const ALL_TYPES = Array.from(Schema.ofAny('Any').getType()?.getAllowedSchemaTypes() ?? []).map(
	e => ({ label: '' + e, value: ('' + e).toUpperCase() }),
);

const MULTIPLE = '_multiple_';

export default function TypeSelector({
	types,
	onChange,
	readOnly = false,
	lockedType,
	disabledReason,
}: Readonly<{
	types: string[];
	onChange: (types: string[]) => void;
	readOnly?: boolean;
	lockedType?: string;
	disabledReason?: string;
}>) {
	const [showMultiple, setShowMultiple] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showMultiple) return;
		const handler = (e: MouseEvent) => {
			if (!popoverRef.current?.contains(e.target as Node)) setShowMultiple(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [showMultiple]);

	if (lockedType) {
		const label = ALL_TYPES.find(t => t.value === lockedType)?.label ?? lockedType;
		return (
			<select className="_typeSelector" value={lockedType} disabled title="Type is fixed">
				<option value={lockedType}>{label}</option>
			</select>
		);
	}

	const isMultiple = types.length > 1;
	const selectValue = isMultiple ? MULTIPLE : (types[0] ?? '');
	const multipleLabel = isMultiple
		? `Multiple (${types.map(v => ALL_TYPES.find(t => t.value === v)?.label ?? v).join(', ')})`
		: 'Multiple…';

	const popover = showMultiple ? (
		<div className="_typePopover" ref={popoverRef}>
			{ALL_TYPES.map(t => (
				<label key={t.value} className="_typeOption">
					<input
						type="checkbox"
						checked={types.includes(t.value)}
						disabled={readOnly}
						onChange={e =>
							onChange(
								e.target.checked
									? [...types, t.value]
									: types.filter(v => v !== t.value),
							)
						}
					/>
					{t.label}
				</label>
			))}
			<button className="_smallButton" onClick={() => setShowMultiple(false)}>
				Done
			</button>
		</div>
	) : undefined;

	return (
		<div className="_typeSelectorContainer">
			<select
				className="_typeSelector"
				value={selectValue}
				disabled={readOnly || !!disabledReason}
				title={disabledReason}
				onChange={e => {
					const v = e.target.value;
					if (v === MULTIPLE) setShowMultiple(true);
					else onChange(v === '' ? [] : [v]);
				}}
			>
				<option value="">None</option>
				{ALL_TYPES.map(t => (
					<option key={t.value} value={t.value}>
						{t.label}
					</option>
				))}
				<option value={MULTIPLE}>{multipleLabel}</option>
			</select>
			{popover}
		</div>
	);
}
