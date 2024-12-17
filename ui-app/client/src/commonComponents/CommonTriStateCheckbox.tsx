import React from 'react';

type CommonTriStateCheckboxType = {
	value: boolean | undefined;
	onChange?: (value: boolean | undefined) => void;
	id?: string;
	isReadOnly?: boolean;
	styles?: any;
	focusHandler?: () => void;
	blurHandler?: () => void;
	states: 2 | 3;
};

function CommonTriStateCheckbox({
	value,
	onChange,
	id,
	isReadOnly = false,
	styles,
	focusHandler,
	blurHandler,
	states = 3,
}: Readonly<CommonTriStateCheckboxType>) {
	let setValue: boolean | undefined = !value;
	if (states === 3 && value !== false) setValue = value === true ? undefined : false;
	return (
		<span
			className={`commonTriStateCheckbox _${states == 3 ? value : !!value} ${
				isReadOnly ? 'disabled' : ''
			}`}
			id={id}
			onClick={() => {
				(isReadOnly ? undefined : onChange)?.(setValue);
			}}
			style={styles}
			onFocus={focusHandler}
			onBlur={blurHandler}
			role="checkbox"
			aria-checked={value}
			tabIndex={0}
			onKeyUp={e =>
				(e.key === 'Enter' || e.key === ' ') && !isReadOnly && onChange?.(setValue)
			}
		/>
	);
}

export default CommonTriStateCheckbox;
