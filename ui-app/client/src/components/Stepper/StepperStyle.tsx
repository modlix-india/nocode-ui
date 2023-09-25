import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './StepperStyleProperties';

const PREFIX = '.comp.compStepper';
export default function StepperStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
		${PREFIX} {
			display: flex;
		}
		  
		${PREFIX} ul {
			display: flex;
			list-style-type: none;
			position: relative;
		}

		${PREFIX} ul._horizontal {
			width: 100%;
			flex-direction: row;
			overflow: auto;
		}

		${PREFIX} ul._vertical {
			flex-direction: column;
		}

		${PREFIX} ._listItem {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
			position: relative;
		}

		${PREFIX} ul._vertical ._listItem {
		    flex-direction: column;
		}

		${PREFIX} ._listItem._nextItem {
			cursor: pointer;
		}

		${PREFIX} ._listItem._previousItem {			
			cursor: pointer;
		}
		
		${PREFIX}._default ul._horizontal ._listItem:last-child,
		${PREFIX}._big_circle ul._horizontal ._listItem:last-child {
		    flex-grow: 0;
		}

		${PREFIX}._default ul._horizontal ._listItem:not(:last-child)::after,
		${PREFIX}._big_circle ul._horizontal ._listItem:not(:last-child)::after {
			content: "";
			min-width: 30px;
			border-bottom: 2px solid;
			align-self: flex-start;
			flex-grow: 1;
		}

		${PREFIX}._default ul._horizontal._textTop ._listItem:not(:last-child)::after,
		${PREFIX}._big_circle ul._horizontal._textTop ._listItem:not(:last-child)::after {
			border-bottom: none;
			border-top: 2px solid;
			align-self: flex-end;
		}
		
		${PREFIX}._default ul._vertical ._listItem:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical ._listItem:not(:last-child)::after {
			content: "";
			min-height: 30px;
			border-left: 2px solid;
			flex-grow: 1;
		}

		${PREFIX}._default ul._vertical._textRight ._listItem:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical._textRight ._listItem:not(:last-child)::after {
			border-left: none;
			border-right: 2px solid;
			align-self: flex-start;
		}

		${PREFIX}._default ul._vertical._textLeft ._listItem:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical._textLeft ._listItem:not(:last-child)::after {
			align-self: flex-end;
		}
		
		${PREFIX} ._itemContainer {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 5px;
			position: relative;
		}

		${PREFIX} ul._vertical ._itemContainer {
			width: 100%;
			justify-content: flex-start;
		}

		${PREFIX} ul._textRight ._itemContainer {
			flex-direction: row;
		}
		
		${PREFIX} ul._textLeft ._itemContainer {
			flex-direction: row-reverse;
		}
				
		${PREFIX} ul._textTop ._itemContainer {
		    flex-direction: column-reverse;
		}
		
		${PREFIX} ._title {
		    white-space: nowrap;
			position: relative;
		}
		${PREFIX} ._icon {
			position: relative;
		}
		${PREFIX} ._step {
			position: relative;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
