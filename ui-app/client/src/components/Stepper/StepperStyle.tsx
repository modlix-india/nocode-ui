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
			padding-inline-start: 0px;
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
			flex-grow: 1;
			flex-shrink: 0;
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

		${PREFIX}._pills ._listItem {
			flex-grow: 0;
		}

		${PREFIX}._rectangle_arrow ._listItem {
			justify-content: center;
		}

		${PREFIX}._rectangle_arrow ._listItem._withLines:not(:last-child)::after {
			content: "";
			width: 0;
			height: 0;
			position: absolute;
			top: 0;
			left: 100%;
			z-index: 1;
		}
		
		${PREFIX}._default ._listItem._withLines:last-child,
		${PREFIX}._big_circle ._listItem._withLines:last-child {
		    flex-grow: 0;
		}

		${PREFIX}._default ul._horizontal ._listItem._withLines:not(:last-child)::after,
		${PREFIX}._big_circle ul._horizontal ._listItem._withLines:not(:last-child)::after {
			content: "";
			align-self: flex-start;
			flex-grow: 1;
		}

		${PREFIX}._default ul._horizontal._textTop ._listItem._withLines:not(:last-child)::after,
		${PREFIX}._big_circle ul._horizontal._textTop ._listItem._withLines:not(:last-child)::after {
			border-bottom: none;
			align-self: flex-end;
		}
		
		${PREFIX}._default ul._vertical ._listItem._withLines:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical ._listItem._withLines:not(:last-child)::after {
			content: "";
			flex-grow: 1;
		}

		${PREFIX}._default ul._vertical._textRight ._listItem._withLines:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical._textRight ._listItem._withLines:not(:last-child)::after {
			border-left: none;
			align-self: flex-start;
		}

		${PREFIX}._default ul._vertical._textLeft ._listItem._withLines:not(:last-child)::after,
		${PREFIX}._big_circle ul._vertical._textLeft ._listItem._withLines:not(:last-child)::after {
			align-self: flex-end;
		}
		
		${PREFIX} ._itemContainer {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
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

		${PREFIX} ._step {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		
		${PREFIX} ._title {
		    white-space: nowrap;
			position: relative;
		}

	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="StepperCss">{css}</style>;
}
