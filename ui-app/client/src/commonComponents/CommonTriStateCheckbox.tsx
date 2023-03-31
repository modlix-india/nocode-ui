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
}: CommonTriStateCheckboxType) {
	return (
		<span
			className={`commonTriStateCheckbox _${states === 3 ? value : !!value} ${
				isReadOnly ? 'disabled' : ''
			}`}
			id={id}
			onClick={() =>
				(isReadOnly ? undefined : onChange)?.(
					states === 3
						? value === true
							? false
							: value === false
							? undefined
							: true
						: !value,
				)
			}
			style={styles}
			onFocus={focusHandler}
			onBlur={blurHandler}
		/>
	);
}

export default CommonTriStateCheckbox;
