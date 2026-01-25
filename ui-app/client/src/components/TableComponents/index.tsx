import React from 'react';
import { Component, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';

import TableStyle from './Table/TableStyle';
import {
	propertiesDefinition as tablePropertiesDefinintion,
	stylePropertiesDefinition as tableStylePropertiesDefinition,
} from './Table/tableProperties';
import {
	styleDefaults as tableStyleDefaults,
	stylePropertiesForTheme as tableStylePropertiesForTheme,
} from './Table/tableStyleProperties';
import TableColumnStyle from './TableColumn/TableColumnStyle';
import {
	propertiesDefinition as tableColumnPropertiesDefinintion,
	stylePropertiesDefinition as tableColumnStylePropertiesDefinition,
} from './TableColumn/tableCloumnProperties';
import {
	styleDefaults as tableColumnStyleDefaults,
	stylePropertiesForTheme as tableColumnStylePropertiesForTheme,
} from './TableColumn/tableColumnStyleProperties';
import TableColumnHeaderStyle from './TableColumnHeader/TableColumnHeaderStyle';
import {
	propertiesDefinition as tableColumnHeaderPropertiesDefinintion,
	stylePropertiesDefinition as tableColumnHeaderStylePropertiesDefinition,
} from './TableColumnHeader/tableCloumnHeaderProperties';
import {
	styleDefaults as tableColumnHeaderStyleDefaults,
	stylePropertiesForTheme as tableColumnHeaderStylePropertiesForTheme,
} from './TableColumnHeader/tableColumnHeaderStyleProperties';
import TableColumnsStyle from './TableColumns/TableColumnsStyle';

import {
	propertiesDefinition as tableColumnsPropertiesDefinition,
	stylePropertiesDefinition as tableColumnsStylePropertiesDefinition,
} from './TableColumns/tableColumnsProperties';

import {
	styleDefaults as tableColumnsStyleDefaults,
	stylePropertiesForTheme as tableColumnsStylePropertiesForTheme,
} from './TableColumns/tableColumnsStyleProperties';
import {
	propertiesDefinition as tableDynamicColumnPropertiesDefinition,
	stylePropertiesDefinition as tableDynamicColumnStylePropertiesDefinition,
} from './TableDynamicColumn/tableDynamicColumnProperties';
import TableEmptyGridStyle from './TableEmptyGrid/TableEmptyGridStyle';
import {
	propertiesDefinition as tableEmptyGridPropertiesDefinintion,
	stylePropertiesDefinition as tableEmptyGridStylePropertiesDefinition,
} from './TableEmptyGrid/tableEmptyGridProperties';

import {
	styleDefaults as tableEmptyGridStyleDefaults,
	styleProperties as tableEmptyGridStyleProperties,
} from './TableEmptyGrid/tableEmptyGridStyleProperties';
import TableGridStyle from './TableGrid/TableGridStyle';

import {
	propertiesDefinition as tableGridPropertiesDefinintion,
	stylePropertiesDefinition as tableGridStylePropertiesDefinition,
} from './TableGrid/tableGridProperties';

import {
	styleDefaults as tableGridStyleDefaults,
	styleProperties as tableGridStyleProperties,
} from './TableGrid/tableGridStyleProperties';
import TablePreviewGridStyle from './TablePreviewGrid/TablePreviewGridStyle';

import {
	propertiesDefinition as tablePreviewGridPropertiesDefinition,
	stylePropertiesDefinition as tablePreviewGridStylePropertiesDefinition,
} from './TablePreviewGrid/tablePreviewGridProperties';

import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import {
	styleDefaults as tablePreviewGridStyleDefaults,
	styleProperties as tablePreviewGridStyleProperties,
} from './TablePreviewGrid/tablePreviewGridStyleProperties';

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

const { tableDesign, colorScheme } = findPropertyDefinitions(
	tablePropertiesDefinintion,
	'tableDesign',
	'colorScheme',
);

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
		externalStylePropsForThemeJson: true,
	stylePropertiesForTheme: tableStylePropertiesForTheme,
	propertiesForTheme: [tableDesign, colorScheme],
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
		stylePropertiesForTheme: tableColumnStylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
	propertiesForTheme: [tableDesign, colorScheme],
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
	
	propertiesForTheme: [tableDesign, colorScheme],
	stylePropertiesForTheme: tableColumnHeaderStylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
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
		propertiesForTheme: [tableDesign, colorScheme],
	stylePropertiesForTheme: tableColumnsStylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
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
		stylePropertiesForTheme: [],
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
		stylePropertiesForTheme: tableEmptyGridStyleProperties,
	externalStylePropsForThemeJson: true,
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
		stylePropertiesForTheme: tableGridStyleProperties,
	externalStylePropsForThemeJson: true,
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

export const TablePreviewGrid: Component = {
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
		stylePropertiesForTheme: tablePreviewGridStyleProperties,
	externalStylePropsForThemeJson: true,
};
