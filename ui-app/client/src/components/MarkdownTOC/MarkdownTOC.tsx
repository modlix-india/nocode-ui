import React, { useEffect, useState } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
} from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './MarkdownTOCProperties';
import { styleDefaults } from './MarkdownTOCStyleProperties';
import { IconHelper } from '../util/IconHelper';
import MarkdownTOCStyle from './MarkdownTOCStyle';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';

interface heading {
	level: number;
	text: string;
	id: string;
	children?: heading[];
	number: string;
}

function MarkdownTOC(props: ComponentProps) {
	const {
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			showTill,
			makeCollapsible,
			makeCollapsibleFrom,
			goToBottomLabel,
			goToTopLabel,
			goToTopStyle,
			goToBottomStyle,
			topTextImage,
			bottomTextImage,
			topLabelText,
			bottomLabelText,
			titleText,
			numericBullets,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const hoverStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const visitedStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: true },
		stylePropertiesWithPseudoStates,
	);

	const regularStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: false, hover: false },
		stylePropertiesWithPseudoStates,
	);

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleComp = (
		<style key={`${styleKey}_style`}>
			{processStyleObjectToCSS(
				regularStyle?.comp,
				`.comp.compMarkdownTOC#_${styleKey}toc_css`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compMarkdownTOC._${styleKey}toc_css:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.comp,
				`.comp.compMarkdownTOC#_${styleKey}toc_css:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.header,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._header`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.header,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._header:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.header,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._header:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H1,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading1`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H1,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading1:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H1,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading1:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H2,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading2`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H2,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading2:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H2,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading2:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H3,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading3`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H3,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading3:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H3,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading3:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H4,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading4`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H4,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading4:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H4,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading4:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H5,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading5`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H5,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading5:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H5,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading5:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.H6,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading6`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.H6,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading6:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.H6,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._heading6:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.collapasibleIcon,
				`.comp.compMarkdownTOC#_${styleKey}toc_css i`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.collapasibleIcon,
				`.comp.compMarkdownTOC#_${styleKey}toc_css i:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.goToTopLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToTopLink`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.goToTopLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToTopLink:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.goToBottomLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToBottomLink`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.goToBottomLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToBottomLink:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.numericBullets,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._numericbullets`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.numericBullets,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._numericbullets:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.numericBullets,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._numericbullets:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.topImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToTopLink > img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.topImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToTopLink > img:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bottomImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToBottomLink > img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bottomImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._goToBottomLink > img:hover`,
			)}
		</style>
	);

	const dataBindingPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	let lastHeading = '';
	const [data, setData] = useState<string>();
	const [expandedHeadings, setExpandedHeadings] = useState<{ [key: string]: boolean }>({});

	useEffect(
		() =>
			dataBindingPath
				? addListenerAndCallImmediatelyWithChildrenActivity(
						(_, v) => setData(v),
						pageExtractor,
						dataBindingPath,
					)
				: undefined,
		[dataBindingPath],
	);

	const parseHeadings = (markdowndata: string): heading[] => {
		const lines = markdowndata.split('\n');
		const headings: heading[] = [];
		const stack: heading[] = [];
		const numbers: number[] = [];
		let firstLevel = 0;

		lines.forEach(line => {
			const match = line.match(/^(#{1,6}) (.+)$/);
			if (match) {
				const level = match[1].length;
				const text = match[2];
				const id = text.toLowerCase().replace(/\s+/g, '-');

				if (firstLevel === 0) {
					firstLevel = level;
				}
				const adjustedLevel = level - firstLevel + 1;

				const heading: heading = {
					level,
					text,
					id,
					number: '',
				};

				if (numbers.length < adjustedLevel) {
					while (numbers.length < adjustedLevel) {
						numbers.push(0);
					}
				}
				numbers[adjustedLevel - 1]++;
				numbers.length = adjustedLevel;
				heading.number = numbers.join('.');

				lastHeading = match[match.length - 1];
				while (stack.length && stack[stack.length - 1].level >= level) {
					stack.pop();
				}
				if (stack.length) {
					const parent = stack[stack.length - 1];
					parent.children = parent.children || [];
					parent.children.push(heading);
				} else {
					headings.push(heading);
				}
				stack.push(heading);
			}
		});
		return headings;
	};

	const headings = typeof data === 'string' ? parseHeadings(data) : [];
	const toggleCollapse = (id: string) => {
		setExpandedHeadings(prev => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const renderHeadings = (headings: heading[], level: number = 1): React.ReactNode => (
		<>
			{headings.map(heading => {
				const shouldRender = heading.level <= parseInt(showTill.charAt(1));
				const isCollapsible =
					makeCollapsible && heading.level <= parseInt(makeCollapsibleFrom.charAt(1));
				const shouldShowChildren = heading.level < parseInt(showTill.charAt(1));
				const shouldCollapseChildren = isCollapsible ? expandedHeadings[heading.id] : true;

				return (
					<React.Fragment key={heading.id}>
						{shouldRender && (
							<a
								href={`#${heading.id}`}
								className={`_heading${heading.level}`}
								style={
									heading.level > 2
										? { marginLeft: `${15 * (heading.level - 1)}px` }
										: {}
								}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName={`H${heading.level}`}
								/>

								{makeCollapsible &&
									heading.children &&
									heading.level <= parseInt(makeCollapsibleFrom.charAt(1)) && (
										<i
											onClick={e => {
												if (isCollapsible && heading.children) {
													e.preventDefault();
													toggleCollapse(heading.id);
												}
											}}
											className={`fa-solid ${expandedHeadings[heading.id] ? 'fa-chevron-down' : 'fa-chevron-right'}`}
										></i>
									)}
								{numericBullets && (
									<span
										className="_numericbullets"
										style={{ marginRight: '10px' }}
									>
										<SubHelperComponent
											definition={definition}
											subComponentName="numericBullets"
										/>
										{heading.number}
									</span>
								)}
								{heading.text}
							</a>
						)}
						{heading.children && shouldShowChildren && (
							<>
								{!isCollapsible || shouldCollapseChildren
									? renderHeadings(heading.children, level + 1)
									: null}
							</>
						)}
					</React.Fragment>
				);
			})}
		</>
	);

	const renderGoToLink = (
		href: string | undefined,
		label: any,
		style: string,
		textImage: string | undefined,
		labelText: any,
		position: string,
	) => (
		<a href={href} className={`_goTo${position}Link`}>
			<SubHelperComponent definition={definition} subComponentName={`goTo${position}Label`} />
			{(style === 'leftImageWithText' || style === 'onlyImage') && (
				<>
					<img src={textImage} alt={`${position} image`} className="_topImage" />
					<SubHelperComponent definition={definition} subComponentName="topImage" />
				</>
			)}
			{(style === 'onlyText' ||
				style === 'leftImageWithText' ||
				style === 'rightImageWithText') &&
				labelText}
			{style === 'rightImageWithText' && (
				<>
					<img src={textImage} alt={`${position} image`} className="_bottomImage" />
					<SubHelperComponent definition={definition} subComponentName="_bottomImage" />
				</>
			)}
		</a>
	);

	return (
		<>
			{styleComp}
			<nav className="comp compMarkdownTOC" id={`_${styleKey}toc_css`}>
				<HelperComponent context={context} definition={definition} />

				{goToTopLabel &&
					renderGoToLink(
						`#${headings[0]?.id}`,
						goToTopLabel,
						goToTopStyle,
						topTextImage,
						topLabelText,
						'Top',
					)}

				<span className="_header">
					{titleText}
					<SubHelperComponent definition={definition} subComponentName="header" />
				</span>

				{renderHeadings(headings)}

				{goToBottomLabel &&
					renderGoToLink(
						`#${lastHeading}`,
						goToBottomLabel,
						goToBottomStyle,
						bottomTextImage,
						bottomLabelText,
						'Bottom',
					)}
			</nav>
		</>
	);
}

const component: Component = {
	name: 'MarkdownTOC',
	displayName: 'Markdown TOC',
	description: 'Table Of Contents for Markdown Text',
	component: MarkdownTOC,
	styleComponent: MarkdownTOCStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'visited'],
	styleProperties: stylePropertiesDefinition,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M1 4.2998H14.2V22.1998C14.2 22.6416 13.8418 22.9998 13.4 22.9998H1V4.2998Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M1 1.8C1 1.35817 1.35817 1 1.8 1H22.2C22.6418 1 23 1.35817 23 1.8V6.5H1V1.8Z"
						fill="currentColor"
					/>
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
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
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
				</IconHelper>
			),
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'H6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'collapasibleIcon',
			displayName: 'Collapasible Icon',
			description: 'Collapasible Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'goToTopLabel',
			displayName: 'Goto Top Label',
			description: 'gototopLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'goToBottomLabel',
			displayName: 'Goto Bottom Label',
			description: 'gotobottomLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'numericBullets',
			displayName: 'Numeric Bullets',
			description: 'numericBullets',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topImage',
			displayName: 'Top Image',
			description: 'topImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomImage',
			displayName: 'Bottom Image',
			description: 'bottomImage',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
