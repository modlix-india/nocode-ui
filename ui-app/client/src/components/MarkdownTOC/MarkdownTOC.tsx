import React, { useEffect, useMemo, useState } from 'react';
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
import { parseInline } from '../../commonComponents/Markdown/parseInline';
import { getAlphaNumeral, getRoman } from '../util/numberConverter';

interface BulletPoint {
	level: number;
	component: JSX.Element;
	id: string;
	number: string;
	children: Array<BulletPoint>;
}

const COUNT_FUNCTIONS: Record<string, (num: number) => string> = {
	NUMBER: (num: number) => num.toString(),
	ROMAN: (num: number) => getRoman(num, false),
	ROMAN_UPPERCASE: (num: number) => getRoman(num, true),
	ALPHA: (num: number) => getAlphaNumeral(num, false),
	ALPHA_UPPERCASE: (num: number) => getAlphaNumeral(num, true),
};

function formatBulletNumber(numbers: number[], bulletType: string): string {
	if (bulletType === 'NONE') {
		return '';
	}
	return numbers.map(num => COUNT_FUNCTIONS[bulletType](num)).join('.');
}

function makeTOCBulletPoints(
	text: string,
	showTill: string,
	bulletType: string,
): Array<BulletPoint> {
	if (!text.trim()) {
		return [];
	}

	const bullets: Array<BulletPoint> = [];

	const lines = text.split('\n');
	const MATCH_REGEX = new RegExp(`^(#{1,${showTill.charAt(1)}}) `);

	const stack: BulletPoint[] = [];
	const numbers: number[] = [];
	let lastBullet = '';

	for (const line of lines) {
		const match = line.match(MATCH_REGEX);
		if (!match) continue;

		const level = match[1].length;
		const text = line.slice(level + 1);
		const id = text.toLowerCase().replace(/\s+/g, '-');

		lastBullet = text;

		const component = (
			<>
				{parseInline({
					lines: [text],
					lineNumber: 0,
					styles: {},
					componentKey: '',
				})}
			</>
		);

		const bullet: BulletPoint = {
			level,
			component,
			id,
			number: '',
			children: [],
		};

		if (numbers.length < level) {
			numbers.push(1);
		} else {
			numbers[level - 1]++;
			numbers.length = level;
		}

		bullet.number = formatBulletNumber(numbers, bulletType);
		while (stack.length && stack[stack.length - 1].level >= level) {
			stack.pop();
		}
		if (stack.length) {
			stack[stack.length - 1].children.push(bullet);
		} else {
			bullets.push(bullet);
		}
		stack.push(bullet);
	}
	return bullets;
}

function MarkdownTOC(props: ComponentProps) {
	const { definition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			markdownText,
			showTill,
			makeCollapsibleFrom,
			titleText,
			topLabelText,
			bottomLabelText,
			topTextIcon,
			topTextImage,
			topIconImagePosition,
			bottomTextIcon,
			bottomTextImage,
			bottomIconImagePosition,
			bulletType,
			bulletIcon,
			bulletImage,
			makeCollapsible,
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
				regularStyle?.titleText,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._titleText`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.titleText,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._titleText:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.titleText,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._titleText:hover`,
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
				regularStyle?.topLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._topLabel`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.topLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._topLabel:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bottomLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._bottomLabel`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bottomLabel,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._bottomLabel:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > ._bulletIconImage`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > ._bulletIconImage:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > ._bulletIconImage:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > img`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > img:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > img:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > span`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > span:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bulletIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > a > span:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.topIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._topLabel > img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.topIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css ._topLabel > img:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.topIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._topLabel > i`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.topIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css ._topLabel > i:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.topIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._topLabel > img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bottomIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css ._bottomLabel > img:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.bottomIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css > ._bottomLabel > i`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.bottomIconImage,
				`.comp.compMarkdownTOC#_${styleKey}toc_css ._bottomLabel > i:hover`,
			)}
		</style>
	);

	const headings = useMemo(
		() => makeTOCBulletPoints(markdownText, showTill, bulletType),
		[markdownText, showTill, bulletType],
	);
	const firstBullet = headings.length > 0 ? headings[0].id : null;
	const lastBullet = headings.length > 0 ? headings[headings.length - 1].id : null;

	return (
		<>
			{styleComp}
			<HelperComponent context={context} definition={definition} />
			<nav className={`comp compMarkdownTOC`} id={`_${styleKey}toc_css`}>
				<a className={`_topLabel ${topIconImagePosition}`} href={`#${firstBullet}`}>
					{topTextIcon && !topTextImage && (
						<i className={`_topIconImage ${topTextIcon}`}>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="topIconImage"
							/>
						</i>
					)}
					{topTextImage && (
						<>
							<img src={topTextImage}></img>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="topIconImage"
							/>
						</>
					)}
					{topLabelText}
					<SubHelperComponent definition={props.definition} subComponentName="topLabel" />
				</a>
				<span className="_titleText">{titleText}</span>
				<SubHelperComponent definition={props.definition} subComponentName="titleText" />
				{headings.map(heading => (
					<ContentLink
						{...heading}
						makeCollapsible={makeCollapsible}
						makeCollapsibleFrom={makeCollapsibleFrom}
						props={props}
						bulletIcon={bulletIcon}
						bulletImage={bulletImage}
					/>
				))}
				<a className={bottomIconImagePosition} href={`#${lastBullet}`}>
					{bottomTextIcon && !bottomTextImage && (
						<i className={bottomTextIcon}>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="bottomIconImage"
							/>
						</i>
					)}
					{bottomTextImage && <img src={bottomTextImage}></img>}
					{bottomLabelText}
					<SubHelperComponent
						definition={props.definition}
						subComponentName="bottomLabel"
					/>
				</a>
			</nav>
		</>
	);
}

function ContentLink({
	level,
	id,
	component,
	children = [],
	number,
	makeCollapsible,
	makeCollapsibleFrom,
	bulletIcon,
	bulletImage,
	props,
}: BulletPoint & {
	makeCollapsible?: boolean;
	makeCollapsibleFrom: string;
	bulletIcon: string;
	bulletImage: string;
	props: ComponentProps;
}) {
	const [expandedHeadings, setExpandedHeadings] = useState<{ [key: string]: boolean }>({});
	const toggleCollapse = (id: string) => {
		setExpandedHeadings(prev => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const isCollapsible = makeCollapsible && level >= parseInt(makeCollapsibleFrom.charAt(1));
	const shouldCollapseChildren = isCollapsible ? expandedHeadings[id] : true;

	return (
		<>
			<a
				key={id}
				href={`#${id}`}
				className={`_heading${level}`}
				style={level >= 2 ? { marginLeft: `${15 * (level - 1)}px` } : {}}
			>
				{makeCollapsible &&
					children.length > 0 &&
					level >= parseInt(makeCollapsibleFrom.charAt(1)) && (
						<i
							onClick={e => {
								e.preventDefault();
								toggleCollapse(id);
							}}
							className={`fa-solid ${expandedHeadings[id] ? 'fa-chevron-down' : 'fa-chevron-right'}`}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="collapsibleIcon"
							/>
						</i>
					)}
				{!bulletImage && (
					<i className={`_bulletIconImage ${bulletIcon}`}>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="_bulletIconImage"
						/>
					</i>
				)}
				{bulletImage && <img className="_bulletIconImage" src={bulletImage}></img>}
				{!bulletIcon && !bulletImage && (
					<span className="_bulletIconImage">
						{number}
						<SubHelperComponent
							definition={props.definition}
							subComponentName="bulletIconImage"
						/>
					</span>
				)}
				{component}
				<SubHelperComponent definition={props.definition} subComponentName={`H${level}`} />
			</a>

			{(!isCollapsible || shouldCollapseChildren) && (
				<>
					{children.map(child => (
						<ContentLink
							key={child.id}
							{...child}
							makeCollapsible={makeCollapsible}
							makeCollapsibleFrom={makeCollapsibleFrom}
							props={props}
							bulletIcon={bulletIcon}
							bulletImage={bulletImage}
						/>
					))}
				</>
			)}
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
			name: 'titleText',
			displayName: 'Title Text',
			description: 'Title Text',
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
			name: 'topLabel',
			displayName: 'Goto Top Label',
			description: 'gototopLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabel',
			displayName: 'Goto Bottom Label',
			description: 'gotobottomLabel',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bulletIconImage',
			displayName: 'Bullet Icon Image',
			description: 'BulletIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topIconImage',
			displayName: 'Top Icon Image',
			description: 'topIconImage',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomIconImage',
			displayName: 'Bottom Icon Image',
			description: 'bottomIconImage',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
