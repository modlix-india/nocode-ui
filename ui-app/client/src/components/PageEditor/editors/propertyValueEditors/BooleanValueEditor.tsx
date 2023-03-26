import { isNullValue } from '@fincity/kirun-js';
import React from 'react';

import CommonTriStateCheckbox from '../../../../commonComponents/CommonTriStateCheckbox';

interface BooleanValueEditorProps {
	value?: boolean;
	title?: string;
	defaultValue?: boolean;
	onChange?: (v: boolean | undefined) => void;
}

export function BooleanValueEditor({
	title,
	value,
	defaultValue,
	onChange,
}: BooleanValueEditorProps) {
	const hasDefaultValue = !isNullValue(defaultValue);
	console.log(title, value, defaultValue);
	return (
		<CommonTriStateCheckbox
			states={hasDefaultValue ? 2 : 3}
			value={value}
			onChange={v => onChange?.(hasDefaultValue ? (defaultValue === v ? undefined : v) : v)}
		/>
	);
}
