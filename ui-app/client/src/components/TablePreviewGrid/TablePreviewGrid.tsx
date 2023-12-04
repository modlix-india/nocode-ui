import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
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
				<HelperComponent definition={definition} />,
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
		[<HelperComponent key={`${key}_hlp`} definition={definition} />, styleComp, childs],
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
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2.22266"
						y="3.51807"
						width="17.1125"
						height="13.4455"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M0.998047 2.91125V15.3021C0.998047 15.7987 1.17187 16.2208 1.54434 16.5933C1.69332 16.7423 1.86714 16.8664 2.04096 16.9409V3.85484H19.9443V2.91125C19.9443 2.41462 19.7705 1.99249 19.398 1.62002C19.0504 1.27238 18.6034 1.07373 18.1068 1.07373H2.81073C2.31411 1.07373 1.89197 1.24755 1.5195 1.62002C1.17187 1.96766 0.998047 2.38979 0.998047 2.91125Z"
						fill="currentColor"
					/>
					<path
						d="M22.9985 20.393V8.00214C22.9985 7.50551 22.8246 7.08338 22.4522 6.71091C22.1045 6.36327 21.6824 6.18945 21.1858 6.18945H5.86486C5.36823 6.18945 4.9461 6.36327 4.57363 6.73574C4.22599 7.08338 4.02734 7.53034 4.02734 8.02697V20.4178C4.02734 20.9144 4.20116 21.3365 4.57363 21.709C4.92127 22.0566 5.36823 22.2553 5.86486 22.2553H21.1858C21.6824 22.2553 22.1045 22.0815 22.477 21.709C22.8246 21.3365 22.9985 20.9144 22.9985 20.393ZM9.88753 20.393C9.88753 20.4923 9.8627 20.5916 9.7882 20.6661C9.71371 20.7406 9.63922 20.7654 9.51506 20.7654H5.86486C5.76553 20.7654 5.66621 20.7406 5.59172 20.6661C5.51722 20.5916 5.49239 20.5171 5.49239 20.393V18.2078C5.49239 18.1085 5.51722 18.0091 5.59172 17.9347C5.66621 17.8602 5.7407 17.8353 5.86486 17.8353H9.51506C9.61438 17.8353 9.71371 17.8602 9.7882 17.9347C9.8627 18.0091 9.88753 18.0836 9.88753 18.2078V20.393ZM9.88753 16.0226C9.88753 16.122 9.8627 16.2213 9.7882 16.2958C9.71371 16.3703 9.63922 16.3951 9.51506 16.3951H5.86486C5.76553 16.3951 5.66621 16.3703 5.59172 16.2958C5.51722 16.2213 5.49239 16.1468 5.49239 16.0226V13.8375C5.49239 13.7382 5.51722 13.6388 5.59172 13.5643C5.66621 13.4899 5.7407 13.465 5.86486 13.465H9.51506C9.61438 13.465 9.71371 13.4899 9.7882 13.5643C9.8627 13.6388 9.88753 13.7133 9.88753 13.8375V16.0226ZM9.88753 11.6523C9.88753 11.7517 9.8627 11.851 9.7882 11.9255C9.71371 12 9.63922 12.0248 9.51506 12.0248H5.86486C5.76553 12.0248 5.66621 12 5.59172 11.9255C5.51722 11.851 5.49239 11.7765 5.49239 11.6523V9.46718C5.49239 9.36786 5.51722 9.26853 5.59172 9.19404C5.66621 9.11954 5.7407 9.09471 5.86486 9.09471H9.51506C9.61438 9.09471 9.71371 9.11954 9.7882 9.19404C9.8627 9.26853 9.88753 9.34303 9.88753 9.46718V11.6523ZM15.7229 20.393C15.7229 20.4923 15.6981 20.5916 15.6236 20.6661C15.5491 20.7406 15.4746 20.7654 15.3504 20.7654H11.7002C11.6009 20.7654 11.5016 20.7406 11.4271 20.6661C11.3526 20.5916 11.3277 20.5171 11.3277 20.393V18.2078C11.3277 18.1085 11.3526 18.0091 11.4271 17.9347C11.5016 17.8602 11.5761 17.8353 11.7002 17.8353H15.3504C15.4497 17.8353 15.5491 17.8602 15.6236 17.9347C15.6981 18.0091 15.7229 18.0836 15.7229 18.2078V20.393ZM15.7229 16.0226C15.7229 16.122 15.6981 16.2213 15.6236 16.2958C15.5491 16.3703 15.4746 16.3951 15.3504 16.3951H11.7002C11.6009 16.3951 11.5016 16.3703 11.4271 16.2958C11.3526 16.2213 11.3277 16.1468 11.3277 16.0226V13.8375C11.3277 13.7382 11.3526 13.6388 11.4271 13.5643C11.5016 13.4899 11.5761 13.465 11.7002 13.465H15.3504C15.4497 13.465 15.5491 13.4899 15.6236 13.5643C15.6981 13.6388 15.7229 13.7133 15.7229 13.8375V16.0226ZM15.7229 11.6523C15.7229 11.7517 15.6981 11.851 15.6236 11.9255C15.5491 12 15.4746 12.0248 15.3504 12.0248H11.7002C11.6009 12.0248 11.5016 12 11.4271 11.9255C11.3526 11.851 11.3277 11.7765 11.3277 11.6523V9.46718C11.3277 9.36786 11.3526 9.26853 11.4271 9.19404C11.5016 9.11954 11.5761 9.09471 11.7002 9.09471H15.3504C15.4497 9.09471 15.5491 9.11954 15.6236 9.19404C15.6981 9.26853 15.7229 9.34303 15.7229 9.46718V11.6523ZM21.5582 20.393C21.5582 20.4923 21.5334 20.5916 21.4589 20.6661C21.3844 20.7406 21.3099 20.7654 21.1858 20.7654H17.5356C17.4362 20.7654 17.3369 20.7406 17.2624 20.6661C17.1879 20.5916 17.1631 20.5171 17.1631 20.393V18.2078C17.1631 18.1085 17.1879 18.0091 17.2624 17.9347C17.3369 17.8602 17.4114 17.8353 17.5356 17.8353H21.1858C21.2851 17.8353 21.3844 17.8602 21.4589 17.9347C21.5334 18.0091 21.5582 18.0836 21.5582 18.2078V20.393ZM21.5582 16.0226C21.5582 16.122 21.5334 16.2213 21.4589 16.2958C21.3844 16.3703 21.3099 16.3951 21.1858 16.3951H17.5356C17.4362 16.3951 17.3369 16.3703 17.2624 16.2958C17.1879 16.2213 17.1631 16.1468 17.1631 16.0226V13.8375C17.1631 13.7382 17.1879 13.6388 17.2624 13.5643C17.3369 13.4899 17.4114 13.465 17.5356 13.465H21.1858C21.2851 13.465 21.3844 13.4899 21.4589 13.5643C21.5334 13.6388 21.5582 13.7133 21.5582 13.8375V16.0226ZM21.5582 11.6523C21.5582 11.7517 21.5334 11.851 21.4589 11.9255C21.3844 12 21.3099 12.0248 21.1858 12.0248H17.5356C17.4362 12.0248 17.3369 12 17.2624 11.9255C17.1879 11.851 17.1631 11.7765 17.1631 11.6523V9.46718C17.1631 9.36786 17.1879 9.26853 17.2624 9.19404C17.3369 9.11954 17.4114 9.09471 17.5356 9.09471H21.1858C21.2851 9.09471 21.3844 9.11954 21.4589 9.19404C21.5334 9.26853 21.5582 9.34303 21.5582 9.46718V11.6523Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
