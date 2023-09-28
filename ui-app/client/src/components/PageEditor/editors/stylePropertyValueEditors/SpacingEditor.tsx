import React, { ReactNode } from 'react';
import { StyleEditorsProps, extractValue } from './simpleEditors';

export function SpacingEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
}: StyleEditorsProps) {
	let padValues: ReactNode[] = [];
	let marginValues: ReactNode[] = [];
	let marginHasValue = false;
	let paddingHasValue = false;
	let propValues: any = {};
	for (let prop of [
		'marginBottom',
		'marginLeft',
		'marginRight',
		'marginTop',
		'paddingBottom',
		'paddingLeft',
		'paddingRight',
		'paddingTop',
	]) {
		const value = extractValue({
			subComponentName,
			prop,
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value;

		const direction = prop.replace('margin', '').replace('padding', '').toLowerCase();

		(prop.startsWith('margin') ? marginValues : padValues).push(
			<div key={prop} className={`_value _${direction} ${value ? '' : '_default'}`}>
				{value ?? direction}
			</div>,
		);

		propValues[prop] = value;

		if (value) {
			if (prop.startsWith('margin')) marginHasValue = true;
			else paddingHasValue = true;
		}
	}
	return (
		<>
			<div className={`_spacingEditor _margin ${marginHasValue ? '_hasValue' : ''}`}>
				<div className={`_label ${marginHasValue ? '_hasValue' : ''}`}>Margin</div>
				<div className={`_square _top ${propValues.marginTop ? '_hasValue' : ''}`} />
				<div className={`_square _left ${propValues.marginLeft ? '_hasValue' : ''}`} />
				<div className={`_square _right ${propValues.marginRight ? '_hasValue' : ''}`} />
				<div className={`_square _bottom ${propValues.marginBottom ? '_hasValue' : ''}`} />
				{marginValues}
				<div className={`_padding ${paddingHasValue ? '_hasValue' : ''}`}>
					<div className={`_label ${paddingHasValue ? '_hasValue' : ''}`}>Padding</div>
					<div className={`_circle _top ${propValues.paddingTop ? '_hasValue' : ''}`} />
					<div className={`_circle _left ${propValues.paddingLeft ? '_hasValue' : ''}`} />
					<div
						className={`_circle _right ${propValues.paddingRight ? '_hasValue' : ''}`}
					/>
					<div
						className={`_circle _bottom ${propValues.paddingBottom ? '_hasValue' : ''}`}
					/>
					{padValues}
				</div>
			</div>
		</>
	);
}
