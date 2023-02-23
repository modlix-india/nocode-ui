import React from 'react';

type CommonCheckBox = {
	isChecked: boolean;
	onChange: (event: any) => void;
	id: string;
	isReadOnly: boolean;
	styles: any;
	focusHandler: () => void;
	blurHandler: () => void;
};

function CheckBox({
	isChecked,
	onChange,
	id,
	isReadOnly,
	styles,
	focusHandler,
	blurHandler,
}: CommonCheckBox) {
	return (
		<input
			className="commonCheckbox"
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

export default CheckBox;
