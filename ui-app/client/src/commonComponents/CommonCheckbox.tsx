import React from 'react';
import { SubHelperComponent } from '../components/HelperComponents/SubHelperComponent';
import { ComponentDefinition } from '../types/common';

type CommonCheckboxType = {
	isChecked: boolean;
	showAsRadio?: boolean;
	onChange?: (event: any) => void;
	id?: string;
	isReadOnly?: boolean;
	styles?: any;
	focusHandler?: () => void;
	blurHandler?: () => void;
	definition?: ComponentDefinition;
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
	definition,
}: CommonCheckboxType) {
	let sh = definition ? (
		<SubHelperComponent
			style={styles ?? {}}
			className={`commonCheckbox ${showAsRadio ? 'radio' : ''}`}
			definition={definition}
			subComponentName="checkbox"
		></SubHelperComponent>
	) : undefined;
	return (
		<>
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
			{sh}
		</>
	);
}

export default CommonCheckbox;
