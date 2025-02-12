import React from 'react';
import { Component, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';

import TableStyle from './Table/TableStyle';
import {
	propertiesDefinition as tablePropertiesDefinintion,
	stylePropertiesDefinition as tableStylePropertiesDefinition,
} from './Table/tableProperties';
import { styleDefaults as tableStyleDefaults } from './Table/tableStyleProperties';
import TableColumnStyle from './TableColumn/TableColumnStyle';
import {
	propertiesDefinition as tableColumnPropertiesDefinintion,
	stylePropertiesDefinition as tableColumnStylePropertiesDefinition,
} from './TableColumn/tableCloumnProperties';
import { styleDefaults as tableColumnStyleDefaults } from './TableColumn/tableColumnStyleProperties';
import TableColumnHeaderStyle from './TableColumnHeader/TableColumnHeaderStyle';
import {
	propertiesDefinition as tableColumnHeaderPropertiesDefinintion,
	stylePropertiesDefinition as tableColumnHeaderStylePropertiesDefinition,
} from './TableColumnHeader/tableCloumnHeaderProperties';
import { styleDefaults as tableColumnHeaderStyleDefaults } from './TableColumnHeader/tableColumnHeaderStyleProperties';
import TableColumnsStyle from './TableColumns/TableColumnsStyle';

import {
	propertiesDefinition as tableColumnsPropertiesDefinition,
	stylePropertiesDefinition as tableColumnsStylePropertiesDefinition,
} from './TableColumns/tableColumnsProperties';

import { styleDefaults as tableColumnsStyleDefaults } from './TableColumns/tableColumnsStyleProperties';
import {
	propertiesDefinition as tableDynamicColumnPropertiesDefinition,
	stylePropertiesDefinition as tableDynamicColumnStylePropertiesDefinition,
} from './TableDynamicColumn/tableDynamicColumnProperties';
import TableEmptyGridStyle from './TableEmptyGrid/TableEmptyGridStyle';
import {
	propertiesDefinition as tableEmptyGridPropertiesDefinintion,
	stylePropertiesDefinition as tableEmptyGridStylePropertiesDefinition,
} from './TableEmptyGrid/tableEmptyGridProperties';

import { styleDefaults as tableEmptyGridStyleDefaults } from './TableEmptyGrid/tableEmptyGridStyleProperties';
import TableGridStyle from './TableGrid/TableGridStyle';

import {
	propertiesDefinition as tableGridPropertiesDefinintion,
	stylePropertiesDefinition as tableGridStylePropertiesDefinition,
} from './TableGrid/tableGridProperties';

import { styleDefaults as tableGridStyleDefaults } from './TableGrid/tableGridStyleProperties';
import TablePreviewGridStyle from './TablePreviewGrid/TablePreviewGridStyle';

import {
	propertiesDefinition as tablePreviewGridPropertiesDefinition,
	stylePropertiesDefinition as tablePreviewGridStylePropertiesDefinition,
} from './TablePreviewGrid/tablePreviewGridProperties';

import { styleDefaults as tablePreviewGridStyleDefaults } from './TablePreviewGrid/tablePreviewGridStyleProperties';

const LazyTableComponent = React.lazy(
	() => import(/* webpackChunkName: "Table" */ './Table/Table'),
);

function LoadLazyTableComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableComponent {...props} />
		</React.Suspense>
	);
}

export const Table: Component = {
	name: 'Table',
	displayName: 'Table',
	description: 'Table component',
	component: LoadLazyTableComponent,
	propertyValidation: (): Array<string> => [],
	properties: tablePropertiesDefinintion,
	styleProperties: tableStylePropertiesDefinition,
	styleComponent: TableStyle,
	stylePseudoStates: ['hover'],
	styleDefaults: tableStyleDefaults,
	allowedChildrenType: new Map([
		['TableEmptyGrid', 1],
		['TableColumns', -1],
		['TableDynamicColumns', -1],
		['TableGrid', 1],
		['TablePreviewGrid', 1],
	]),
	bindingPaths: {
		bindingPath: { name: 'Array Binding' },
		bindingPath2: { name: 'Selection Binding' },
		bindingPath3: { name: 'Page Number Binding' },
		bindingPath4: { name: 'Page Size Binding' },
		bindingPath5: { name: 'Table Display Mode Binding' },
		bindingPath6: { name: 'Sort Binding' },
		bindingPath7: { name: 'Personalization Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
						className="_tableline"
					/>
					<path
						className="_tableline"
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
						className="_tableHeader"
					/>
				</IconHelper>
			),
		},
		{
			name: 'modesContainer',
			displayName: 'Modes Container',
			description: 'Modes Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeIcon',
			displayName: 'Columns Mode Icon',
			description: 'Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedColumnsModeIcon',
			displayName: 'Selected Columns Mode Icon',
			description: 'Selected Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeImage',
			displayName: 'Columns Mode Image',
			description: 'Columns Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeIcon',
			displayName: 'Grid Mode Icon',
			description: 'Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedGridModeIcon',
			displayName: 'Selected Grid Mode Icon',
			description: 'Selected Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeImage',
			displayName: 'Grid Mode Image',
			description: 'Grid Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextArrow',
			displayName: 'Next Arrow',
			description: 'Next Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousArrow',
			displayName: 'Previous Arrow',
			description: 'Previous Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextText',
			displayName: 'Next Text',
			description: 'Next Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousText',
			displayName: 'Previous Text',
			description: 'Previous Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageNumbers',
			displayName: 'Page Numbers',
			description: 'Page Numbers',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedPageNumber',
			displayName: 'Selected Page Number',
			description: 'Selected Page Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'itemsPerPageDropdown',
			displayName: 'Items per page Dropdown',
			description: 'Items per page Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'perPageLabel',
			displayName: 'Per Page Label',
			description: 'Per Page Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionDropdown',
			displayName: 'Page Selection Dropdown',
			description: 'Page Selection Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionLabel',
			displayName: 'Page Selection Label',
			description: 'Page Selection Label',
			icon: 'fa-solid fa-box',
		},
	],
};

const LazyTableColumnComponent = React.lazy(
	() => import(/* webpackChunkName: "TableColumn" */ './TableColumn/TableColumn'),
);

function LoadLazyTableColumnComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableColumnComponent {...props} />
		</React.Suspense>
	);
}

export const TableColumn: Component = {
	name: 'TableColumn',
	displayName: 'Table Column',
	description: 'Table Column component',
	component: LoadLazyTableColumnComponent,
	propertyValidation: (): Array<string> => [],
	properties: tableColumnPropertiesDefinintion,
	styleComponent: TableColumnStyle,
	styleDefaults: tableColumnStyleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	parentType: 'TableColumns',
	stylePseudoStates: ['hover'],
	styleProperties: tableColumnStylePropertiesDefinition,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="21.9967"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="23"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortAscendingIcon',
			displayName: 'Sort Ascending Icon',
			description: 'Sort Ascending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortDescendingIcon',
			displayName: 'Sort Descending Icon',
			description: 'Sort Descending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortNoneIcon',
			displayName: 'Sort None Icon',
			description: 'Sort None Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],
};

const LazyTableColumnHeaderComponent = React.lazy(
	() =>
		import(/* webpackChunkName: "TableColumnHeader" */ './TableColumnHeader/TableColumnHeader'),
);

function LoadLazyTableColumnHeaderComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableColumnHeaderComponent {...props} />
		</React.Suspense>
	);
}

export const TableColumnHeader: Component = {
	name: 'TableColumnHeader',
	displayName: 'Table Header',
	description: 'Table Header component',
	component: LoadLazyTableColumnHeaderComponent,
	propertyValidation: (): Array<string> => [],
	styleProperties: tableColumnHeaderStylePropertiesDefinition,
	properties: tableColumnHeaderPropertiesDefinintion,
	styleComponent: TableColumnHeaderStyle,
	styleDefaults: tableColumnHeaderStyleDefaults,
	isHidden: true,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-diagram-next',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],
};

const LazyTableColumnsComponent = React.lazy(
	() => import(/* webpackChunkName: "TableColumns" */ './TableColumns/TableColumns'),
);

function LoadLazyTableColumnsComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableColumnsComponent {...props} />
		</React.Suspense>
	);
}

export const TableColumns: Component = {
	name: 'TableColumns',
	displayName: 'Table Columns',
	description: 'Table Columns component',
	component: LoadLazyTableColumnsComponent,
	styleProperties: tableColumnsStylePropertiesDefinition,
	propertyValidation: (): Array<string> => [],
	properties: tableColumnsPropertiesDefinition,
	styleComponent: TableColumnsStyle,
	styleDefaults: tableColumnsStyleDefaults,
	allowedChildrenType: new Map([
		['TableColumn', -1],
		['TableDynamicColumn', -1],
	]),
	parentType: 'Table',
	stylePseudoStates: ['hover'],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
						className="_tableHeader"
					/>
				</IconHelper>
			),
		},
		{
			name: 'row',
			displayName: 'Row',
			description: 'Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedRow',
			displayName: 'Selected Row',
			description: 'Selected Row',
			icon: 'fa-solid fa-box',
		},
	],
};

export const TableDynamicColumn: Component = {
	name: 'TableDynamicColumn',
	displayName: 'Table Dynamic Column',
	description: 'Table Dynamic Column component',
	component: () => <></>,
	styleProperties: tableDynamicColumnStylePropertiesDefinition,
	propertyValidation: (): Array<string> => [],
	properties: tableDynamicColumnPropertiesDefinition,
	styleComponent: () => <></>,
	styleDefaults: tableColumnStyleDefaults,
	parentType: 'TableColumns',
	stylePseudoStates: ['hover'],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="12.6"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="12"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="19.5"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="31.5"
						y="3.53955"
						width="10"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'Left Icon',
			description: 'Left icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'Right Icon',
			description: 'Right icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortAscendingIcon',
			displayName: 'Sort Ascending Icon',
			description: 'Sort Ascending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortDescendingIcon',
			displayName: 'Sort Descending Icon',
			description: 'Sort Descending Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sortNoneIcon',
			displayName: 'Sort None Icon',
			description: 'Sort None Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],
};

const LazyTableEmptyGridComponent = React.lazy(
	() => import(/* webpackChunkName: "TableEmptyGrid" */ './TableEmptyGrid/TableEmptyGrid'),
);

function LoadLazyTableEmptyGridComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableEmptyGridComponent {...props} />
		</React.Suspense>
	);
}

export const TableEmptyGrid: Component = {
	name: 'TableEmptyGrid',
	displayName: 'Table Empty Grid',
	description: 'Table Empty Grid component',
	component: LoadLazyTableEmptyGridComponent,
	propertyValidation: (): Array<string> => [],
	properties: tableEmptyGridPropertiesDefinintion,
	styleProperties: tableEmptyGridStylePropertiesDefinition,
	styleComponent: TableEmptyGridStyle,
	styleDefaults: tableEmptyGridStyleDefaults,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	parentType: 'Table',
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.6989 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.6989 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="12.6"
						y="17.5"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_tablePG"
						x="3.69995"
						y="11.6992"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<rect
						className="_tablePG"
						x="21.5"
						y="11.6992"
						width="5"
						height="2"
						fill="#EDEAEA"
					/>
					<path
						className="_tablePG"
						d="M3.69995 24H8.69995V26H4.19995C3.92381 26 3.69995 25.7761 3.69995 25.5V24Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tablePG"
						d="M26.4 24H21.4V26H25.9C26.1762 26 26.4 25.7761 26.4 25.5V24Z"
						fill="#EDEAEA"
					/>
				</IconHelper>
			),
		},
	],
};

const LazyTableGridComponent = React.lazy(
	() => import(/* webpackChunkName: "TableGrid" */ './TableGrid/TableGrid'),
);

function LoadLazyTableGridComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTableGridComponent {...props} />
		</React.Suspense>
	);
}

export const TableGrid: Component = {
	name: 'TableGrid',
	displayName: 'Table Grid',
	description: 'Table Grid component',
	component: LoadLazyTableGridComponent,
	propertyValidation: (): Array<string> => [],
	properties: tableGridPropertiesDefinintion,
	styleProperties: tableGridStylePropertiesDefinition,
	styleComponent: TableGridStyle,
	styleDefaults: tableGridStyleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	parentType: 'Table',
	stylePseudoStates: ['hover'],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect x="1" y="9.7998" width="5.5" height="4.4" rx="0.2" fill="currentColor" />
					<path
						d="M1 17.5H6.5V23H1.8C1.35817 23 1 22.6418 1 22.2V17.5Z"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="9.7998"
						width="4.4"
						height="4.4"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="17.5"
						y="9.7998"
						width="5.5"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.5 17.5H23V22.2C23 22.6418 22.6418 23 22.2 23H17.5V17.5Z"
						fill="currentColor"
					/>
					<path d="M1 6.5H6.5V1H1.8C1.35817 1 1 1.35817 1 1.8V6.5Z" fill="currentColor" />
					<rect
						width="4.4"
						height="5.5"
						rx="0.2"
						transform="matrix(1 0 0 -1 9.80078 6.5)"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M17.5 6.5H23V1.8C23 1.35817 22.6418 1 22.2 1H17.5V6.5Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'eachGrid',
			displayName: 'Each Grid',
			description: 'Each Grid',
			icon: 'fa-solid fa-box',
		},
	],
};

const LazyTablePreviewGridComponent = React.lazy(
	() => import(/* webpackChunkName: "TablePreviewGrid" */ './TablePreviewGrid/TablePreviewGrid'),
);

function LoadLazyTablePreviewGridComponent(props: Readonly<ComponentProps>) {
	return (
		<React.Suspense fallback={<></>}>
			<LazyTablePreviewGridComponent {...props} />
		</React.Suspense>
	);
}

export const TablePreviewGrid = {
	name: 'TablePreviewGrid',
	displayName: 'Table Preview Grid',
	description: 'Table Preview Grid component',
	component: LoadLazyTablePreviewGridComponent,
	propertyValidation: (): Array<string> => [],
	properties: tablePreviewGridPropertiesDefinition,
	styleComponent: TablePreviewGridStyle,
	styleDefaults: tablePreviewGridStyleDefaults,
	styleProperties: tablePreviewGridStylePropertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	parentType: 'Table',
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.6989 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.6989 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="12.6"
						y="17.5"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="3.69995"
						y="11.6992"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<rect
						className="_tablePG"
						x="21.5"
						y="11.6992"
						width="5"
						height="2"
						fill="#2196F3"
					/>
					<path
						className="_tablePG"
						d="M3.69995 24H8.69995V26H4.19995C3.92381 26 3.69995 25.7761 3.69995 25.5V24Z"
						fill="#2196F3"
					/>
					<path
						className="_tablePG"
						d="M26.4 24H21.4V26H25.9C26.1762 26 26.4 25.7761 26.4 25.5V24Z"
						fill="#2196F3"
					/>
				</IconHelper>
			),
		},
	],
};
