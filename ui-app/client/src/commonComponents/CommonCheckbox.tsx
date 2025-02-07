import React from 'react';
import { SubHelperComponent } from '../components/HelperComponents/SubHelperComponent';
import { ComponentDefinition } from '../types/common';

type CommonCheckboxType = {
	isChecked: boolean;
	showAsRadio?: boolean;
	onChange?: (value: boolean, event?: React.SyntheticEvent) => void;
	id?: string;
	isReadOnly?: boolean;
	styles?: any;
	thumbStyles?: any;
	focusHandler?: () => void;
	blurHandler?: () => void;
	definition?: ComponentDefinition;
	stopPropagation?: boolean;
};

function CommonCheckbox({
	isChecked,
	onChange,
	showAsRadio = false,
	id,
	isReadOnly = false,
	styles,
	thumbStyles,
	focusHandler,
	blurHandler,
	definition,
	stopPropagation,
}: CommonCheckboxType) {
	const sh = definition ? (
		<SubHelperComponent definition={definition} subComponentName="checkbox" />
	) : undefined;

	const sh2 = definition ? (
		<SubHelperComponent definition={definition} subComponentName="thumb" zIndex={6} />
	) : undefined;
	const handleClick = (e: React.MouseEvent) => {
		if (stopPropagation) {
			e.stopPropagation();
		}
		if (isReadOnly) return;
		onChange?.(!isChecked, e);
	};

	return (
		<span
			className={`commonCheckbox ${showAsRadio ? 'radio' : ''} ${
				isChecked ? '_checked' : ''
			} ${isReadOnly ? '_disabled' : ''}`}
			role="checkbox"
			id={id}
			onClick={handleClick}
			style={styles ?? {}}
			onFocus={focusHandler}
			onBlur={blurHandler}
			tabIndex={0}
			onKeyUp={
				isReadOnly
					? undefined
					: e => {
							if (e.key !== 'Enter' && e.key !== ' ') return;
							onChange?.(!isChecked);
						}
			}
		>
			{sh}
			<span className="_thumb" style={thumbStyles ?? {}}>
				{sh2}
			</span>
		</span>
	);
}

export default CommonCheckbox;
