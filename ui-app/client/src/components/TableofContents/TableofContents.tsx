import React, { useEffect, useState } from 'react';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
	LocationHistory,
} from '../../types/common';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from '../TableofContents/TableofContentsProperties';
import { styleDefaults } from '../TableofContents/TableofContentsStyleProperties';
import { IconHelper } from '../util/IconHelper';
import TableofContentsStyle from './TableofContentsStyle';
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

function TableofContents(props: ComponentProps) {
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			showTill,
			makeCollapsible,
			makeCollapsibleTill,
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
				`.comp.compTableOfContent#_${styleKey}link_css`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compTableOfContent._${styleKey}link_css:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.comp,
				`.comp.compTableOfContent#_${styleKey}link_css:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.externalIcon,
				`.comp.compTableOfContent#_${styleKey}link_css > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.externalIcon,
				`.comp.compTableOfContent#_${styleKey}link_css:visited > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.externalIcon,
				`.comp.compTableOfContent#_${styleKey}link_css:hover > ._externalButton`,
			)}
		</style>
	);

	const dataBindingPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	let lastHeading = '';
	const [data, setData] = useState<string>();
	const [expandedHeadings, setExpandedHeadings] = useState<{ [key: string]: boolean }>({});
	console.log('expand', expandedHeadings);
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

	console.log('data', data);

	const parseHeadings = (markdowndata: string): heading[] => {
		const lines = markdowndata.split('\n');
		const headings: heading[] = [];
		const stack: heading[] = [];
		const numbers: number[] = [];

		lines.forEach(line => {
			const match = line.match(/^(#{1,6}) (.+)$/);
			if (match) {
				const level = match[1].length;
				const text = match[2];
				const id = text.toLowerCase().replace(/\s+/g, '-');
				const heading: heading = {
					level,
					text,
					id,
					number: '',
				};

				if (numbers.length < level) {
					numbers.push(1);
				} else {
					numbers[level - 1]++;
				}
				numbers.length = level;
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
	console.log('headings', headings);

	const renderHeadings = (headings: heading[], level: number = 1): React.ReactNode => (
		<>
			{headings.map(heading => {
				const shouldRender = heading.level <= parseInt(showTill.charAt(1));
				const isCollapsible =
					makeCollapsible && heading.level <= parseInt(makeCollapsibleTill.charAt(1));
				const shouldShowChildren = heading.level < parseInt(showTill.charAt(1));
				const shouldCollapseChildren = isCollapsible ? expandedHeadings[heading.id] : true;
				console.log('shouldrender', shouldRender, showTill.charAt(1));
				console.log(
					'shd',
					shouldShowChildren,
					expandedHeadings[heading.id],
					heading.children,
				);
				console.log('main', heading);

				return (
					<React.Fragment key={heading.id}>
						{shouldRender && (
							<a href={`#${heading.id}`} className={`_heading${heading.level}`}>
								<SubHelperComponent
									definition={definition}
									subComponentName={`H${heading.level}`}
								/>
								{numericBullets && (
									<span
										className="_numericbullets"
										style={{ marginRight: '20px' }}
									>
										<SubHelperComponent
											definition={definition}
											subComponentName="numericBullets"
										/>
										{heading.number}
									</span>
								)}
								{makeCollapsible &&
									heading.children &&
									heading.level <= parseInt(makeCollapsibleTill.charAt(1)) && (
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
								{heading.text}
							</a>
						)}
						{heading.children && shouldShowChildren && (
							<nav className="_children" style={{ marginLeft: '20px' }}>
								{!isCollapsible || shouldCollapseChildren
									? renderHeadings(heading.children, level + 1)
									: null}
							</nav>
						)}
					</React.Fragment>
				);
			})}
		</>
	);

	console.log('lastHeading', lastHeading);
	console.log('gototop', goToBottomStyle);
	return (
		<nav className={`comp compTableOfContent`}>
			{styleComp}
			<HelperComponent context={props.context} definition={definition} />
			{goToTopLabel && (
				<a href={`#${headings[0]?.id}`} className="_goToTopLink">
					<SubHelperComponent definition={definition} subComponentName="goToTopLabel" />
					{(goToTopStyle === 'leftImageWithText' || goToTopStyle === 'onlyImage') && (
						<img src={topTextImage} alt="Top image" />
					)}
					{goToTopStyle === 'onlyText' ||
					goToTopStyle === 'leftImageWithText' ||
					goToTopStyle === 'rightImageWithText'
						? topLabelText
						: ''}
					{goToTopStyle === 'rightImageWithText' && (
						<img src={topTextImage} alt="Bottom image" />
					)}
				</a>
			)}
			<span>{titleText}</span>
			{renderHeadings(headings)}
			{goToBottomLabel && (
				<a href={`#${lastHeading}`} className="_goToBottomLink">
					<SubHelperComponent
						definition={definition}
						subComponentName="goToBottomLabel"
					/>
					{(goToBottomStyle === 'leftImageWithText' ||
						goToBottomStyle === 'onlyImage') && (
						<img src={bottomTextImage}>
							<SubHelperComponent definition={definition} subComponentName="image" />
						</img>
					)}
					{goToBottomStyle === 'onlyText' ||
					goToBottomStyle === 'rightImageWithText' ||
					goToBottomStyle === 'leftImageWithText'
						? bottomLabelText
						: ''}
					{goToBottomStyle == 'rightImageWithText' && (
						<img src={bottomTextImage}>
							<SubHelperComponent definition={definition} subComponentName="image" />
						</img>
					)}
				</a>
			)}
		</nav>
	);
}

const component: Component = {
	name: 'TableofContent',
	displayName: 'TableofContent',
	description: 'TableofContents for Markdown component',
	component: TableofContents,
	styleComponent: TableofContentsStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'visited'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'TableOfContentData Binding' },
	},
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
			name: 'Header',
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
			name: 'goToTopLabel',
			displayName: 'gototopLabel',
			description: 'gototopLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'goToBottomLabel',
			displayName: 'gotobottomLabel',
			description: 'gotobottomLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'numericBullets',
			displayName: 'numericBullets',
			description: 'numericBullets',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topImage',
			displayName: 'topImage',
			description: 'topImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomImage',
			displayName: 'bottomImage',
			description: 'bottomImage',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
