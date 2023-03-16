import React from 'react';

type CommonCheckboxType = {
	isChecked: boolean;
	showAsRadio?: boolean;
	onChange?: (event: any) => void;
	id?: string;
	isReadOnly?: boolean;
	styles?: any;
	focusHandler?: () => void;
	blurHandler?: () => void;
};

function CommonCheckbox({
	isChecked,
	onChange,
	showAsRadio = false,
	id,
	isReadOnly = false,
	styles,
	focusHandler,
	blurHandler,
}: CommonCheckboxType) {
	return (
		<input
			className={`commonCheckbox ${showAsRadio ? 'radio' : ''}`}
			disabled={isReadOnly}
			type="checkbox"
			id={id}
			onChange={onChange}
			checked={isChecked}
			style={styles}
			onFocus={focusHandler}
			onBlur={blurHandler}
		/>
	);
}

export default CommonCheckbox;
