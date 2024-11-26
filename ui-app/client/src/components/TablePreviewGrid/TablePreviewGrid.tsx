import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { addListener, getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tablePreviewGridProperties';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import TablePreviewGridStyle from './TablePreviewGridStyle';
import { styleDefaults } from './tablePreviewGridStyleProperties';
import { IconHelper } from '../util/IconHelper';

function TablePreviewGrid(props: ComponentProps) {
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			readOnly: isReadonly = false,
			linkPath,
			target,
			containerType,
			layout,
			onClick,
			background,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={{ ...context, isReadonly }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
		key,
	)}.isRunning`;

	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, locationHistory, pageExtractor) ?? false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath), []);

	const handleClick =
		!clickEvent || isLoading
			? undefined
			: async () =>
					await runEvent(
						clickEvent,
						onClick,
						props.context.pageName,
						props.locationHistory,
						props.pageDefinition,
					);
	const styleComp = resolvedStyles?.comp?.hideScrollBar ? (
		<style>{`._${key}_grid_css::-webkit-scrollbar { display: none }`}</style>
	) : undefined;
	if (linkPath) {
		return React.createElement(
			containerType.toLowerCase(),
			{ className: 'comp compTablePreviewGrid' },
			[
				<HelperComponent context={props.context} definition={definition} />,
				styleComp,
				<Link
					className={`_anchorGrid _${layout} ${background} _${key}_grid_css`}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
					}
					onFocus={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					onBlur={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
					to={linkPath}
					target={target}
					style={resolvedStyles.comp ?? {}}
				>
					{childs}
				</Link>,
			],
		);
	}

	return React.createElement(
		containerType.toLowerCase(),
		{
			onMouseEnter: stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined,
			onMouseLeave: stylePropertiesWithPseudoStates?.hover
				? () => setHover(false)
				: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,
			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,
			className: `comp compTablePreviewGrid _noAnchorGrid _${layout} ${background} _${key}_grid_css`,
			style: resolvedStyles.comp ?? {},

			onClick: handleClick,
		},
		[
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />,
			styleComp,
			childs,
		],
	);
}

const component: Component = {
	name: 'TablePreviewGrid',
	displayName: 'Table Preview Grid',
	description: 'Table Preview Grid component',
	component: TablePreviewGrid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TablePreviewGridStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
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

export default component;
