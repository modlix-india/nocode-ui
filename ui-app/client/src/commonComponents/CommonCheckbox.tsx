import React from 'react';
import { SubHelperComponent } from '../components/SubHelperComponent';
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
	definition: ComponentDefinition;
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
			<SubHelperComponent
				style={styles ?? {}}
				className={`commonCheckbox ${showAsRadio ? 'radio' : ''}`}
				definition={definition}
				subComponentName="checkbox"
			></SubHelperComponent>
		</>
	);
}

export default CommonCheckbox;
