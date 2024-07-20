import React, { useEffect, useRef, useState } from 'react';
import { MarkdownParser } from '../../commonComponents/Markdown/MarkdownParser';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import MarkdownEditorStyle from './MarkdownEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './markdownEditorProperties';
import { styleDefaults } from './markdownEditorStyleProperties';
import { runEvent } from '../util/runEvent';

function MarkdownEditor(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: { readOnly, emptyStringValue, onChange, onBlur, editType } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [mode, setMode] = useState<'editText' | 'editDoc' | 'editTextnDoc'>(
		editType ?? 'editText',
	);
	const [text, setText] = useState<string>('');
	const [buttonBarPosition, setButtonBarPosition] = useState({ x: 0, y: 0 });
	const textAreaRef = useRef<any>(null);
	const buttonBarRef = useRef<any>(null);
	const resizerBarRef = useRef<any>(null);
	const [textAreaWidth, setTextAreaWidth] = useState<number>(0);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPathPath) return;

		let updateEditor = true;
		return addListenerAndCallImmediately(
			(_, fromStore) => {
				setText(fromStore ?? '');
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, textAreaRef.current]);

	useEffect(() => setMode(editType), [editType]);

	const onBlurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const onChangeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;

	let renderingComponent = undefined;

	if (textAreaRef.current)
		textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';

	if (readOnly) {
		renderingComponent = <MarkdownParser text={text} styles={styleProperties} />;
	} else {
		const onChangeText = (editedText: string) => {
			if (!bindingPathPath) return;
			setText(editedText);
			setData(
				bindingPathPath,
				editedText === '' && emptyStringValue === 'UNDEFINED' ? undefined : editedText,
				context.pageName,
				true,
			);
			if (!onChangeEvent) return;
			(async () =>
				await runEvent(
					onChangeEvent,
					onChange,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		};
		const showText = mode.indexOf('Text') != -1;
		const showDoc = mode.indexOf('Doc') != -1;
		const showBoth = showText && showDoc;
		const finTextAreaWidth = showBoth ? `calc(50% + ${textAreaWidth}px)` : '100%';
		const textComp = showText ? (
			<textarea
				ref={textAreaRef}
				value={text}
				style={
					styleProperties.textArea
						? {
								...styleProperties.textArea,
								width: finTextAreaWidth,
							}
						: { width: finTextAreaWidth }
				}
				onBlur={
					onBlurEvent
						? () =>
								(async () =>
									await runEvent(
										onBlurEvent,
										onBlur,
										props.context.pageName,
										props.locationHistory,
										props.pageDefinition,
									))()
						: undefined
				}
				onChange={ev => onChangeText(ev.target.value)}
			/>
		) : undefined;

		const docComp = showDoc ? (
			<MarkdownParser
				text={text}
				styles={styleProperties}
				editable={true}
				onChange={onChangeText}
				className={showBoth ? '_both' : ''}
			/>
		) : undefined;

		const resizer = showBoth ? (
			<div
				className="_resizer"
				style={{ left: finTextAreaWidth }}
				ref={resizerBarRef}
				onDoubleClick={() => setTextAreaWidth(0)}
				onMouseDown={ev => {
					if (ev.buttons !== 1 || !resizerBarRef.current) return;
					const currentX = ev.clientX;
					let newTAW = textAreaWidth;
					const mouseMove = (ev: MouseEvent) => {
						if (ev.buttons !== 1) return;
						newTAW = textAreaWidth + ev.clientX - currentX;
						textAreaRef.current.style.width = `calc(50% + ${newTAW}px)`;
						resizerBarRef.current.style.left = `calc(50% + ${newTAW}px)`;
					};

					const mouseUp = () => {
						setTextAreaWidth(newTAW);
						document.removeEventListener('mousemove', mouseMove);
						document.removeEventListener('mouseup', mouseUp);
					};

					document.addEventListener('mousemove', mouseMove);
					document.addEventListener('mouseup', mouseUp);
				}}
			/>
		) : undefined;

		renderingComponent = (
			<>
				{textComp}
				{resizer}
				{docComp}
			</>
		);
	}

	const buttonBar = readOnly ? undefined : (
		<div
			className="_buttonBar"
			ref={buttonBarRef}
			style={
				styleProperties.buttonBar
					? {
							...styleProperties.buttonBar,
							transform: `translate(${buttonBarPosition.x}px, ${buttonBarPosition.y}px)`,
						}
					: { transform: `translate(${buttonBarPosition.x}px, ${buttonBarPosition.y}px)` }
			}
			onMouseDown={ev => {
				if (ev.buttons !== 1 || !buttonBarRef.current) return;
				const currentLocation = { x: ev.clientX, y: ev.clientY };
				let newX = buttonBarPosition.x;
				let newY = buttonBarPosition.y;
				const mouseMove = (ev: MouseEvent) => {
					if (ev.buttons !== 1) return;
					newX = buttonBarPosition.x + ev.clientX - currentLocation.x;
					newY = buttonBarPosition.y + ev.clientY - currentLocation.y;
					buttonBarRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
				};
				const mouseUp = () => {
					setButtonBarPosition({
						x: newX,
						y: newY,
					});
					document.removeEventListener('mousemove', mouseMove);
					document.removeEventListener('mouseup', mouseUp);
				};
				document.addEventListener('mousemove', mouseMove);
				document.addEventListener('mouseup', mouseUp);
			}}
		>
			<button
				onClick={() => setMode('editText')}
				style={styleProperties.button ?? {}}
				className={`_button ${mode === 'editText' ? 'active' : ''}`}
			>
				<svg viewBox="0 0 32 15.848">
					<path
						d="M12.417,7.145.522,2.2V-.9L12.417-5.837v3.714L5.188.66l7.229,2.793ZM17.385-7.28h2.176L15.712,8.568H13.557ZM20.628,7.145,32.522,2.2V-.9L20.628-5.837v3.714L27.857.66,20.628,3.453Z"
						transform="translate(-0.522 7.28)"
						fill="currentColor"
					/>
				</svg>
			</button>
			<button
				onClick={() => setMode('editTextnDoc')}
				style={styleProperties.button ?? {}}
				className={`_button ${mode === 'editTextnDoc' ? 'active' : ''}`}
			>
				<svg viewBox="0 0 32 20.289">
					<g transform="translate(-1300.522 -623.473)">
						<path
							d="M1.339,20.289c-.447,0-.9-.018-1.339-.053v-2.87c.158.008.326.013.5.013,4.687,0,8.5-3.341,8.5-7.447S5.187,2.485.5,2.485c-.167,0-.335,0-.5.013V.052C.446.017.9,0,1.339,0c8.528,0,13.75,6.217,15.6,8.89a2.143,2.143,0,0,1-.009,2.507C15.056,14.071,9.786,20.289,1.339,20.289Z"
							transform="translate(1315.184 623.473)"
							fill="currentColor"
						/>
						<path
							d="M11.167,5.63.522,1.2V-1.569L11.167-5.988v3.324L4.7-.174l6.469,2.5Z"
							transform="translate(1300 633.884)"
							fill="currentColor"
						/>
						<path
							d="M7.58,8.242a3.177,3.177,0,0,0,1.152-.215,3.03,3.03,0,0,0,.977-.614,2.825,2.825,0,0,0,.653-.918,2.684,2.684,0,0,0,.229-1.083c0-.32-.392-.466-.726-.4a1.88,1.88,0,0,1-.362.034,1.913,1.913,0,0,1-.815-.182,1.8,1.8,0,0,1-.642-.507,1.658,1.658,0,0,1-.332-.723,1.61,1.61,0,0,1,.048-.786.186.186,0,0,0,.011-.09.19.19,0,0,0-.032-.085.2.2,0,0,0-.07-.063.219.219,0,0,0-.092-.027,3.112,3.112,0,0,0-2.13.829,2.714,2.714,0,0,0,0,4,3.112,3.112,0,0,0,2.13.829Z"
							transform="translate(1310.648 628.205)"
							fill="currentColor"
						/>
					</g>
				</svg>
			</button>
		</div>
	);

	return (
		<div className={`comp compMarkdownEditor`} style={styleProperties.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{buttonBar}
			<div className="_editorContainer">{renderingComponent}</div>
		</div>
	);
}

const component: Component = {
	name: 'MarkdownEditor',
	displayName: 'Markdown Editor',
	description: 'Markdown Editor',
	component: MarkdownEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: MarkdownEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		type: 'MarkdownEditor',
		name: 'Markdown Editor',
	},
	bindingPaths: {
		bindingPath: { name: 'Markdown Text' },
	},
	sections: [],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 22 22">
					<g transform="translate(-1234.51 -629.334)">
						<rect
							width="22"
							height="22"
							rx="1"
							transform="translate(1234.51 629.334)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<g transform="translate(0 2.529)">
							<path
								d="M.991-10.021H5.065l1.572,6.1,1.565-6.1h4.061V0H9.734V-7.643L7.772,0H5.482L3.527-7.643V0H.991Z"
								transform="translate(1235.736 643.127)"
								fill="currentColor"
							/>
							<path
								d="M3,0,6,4H0Z"
								transform="translate(1255 644) rotate(180)"
								fill="currentColor"
							/>
							<rect
								width="2"
								height="7"
								transform="translate(1251 633)"
								fill="currentColor"
							/>
						</g>
					</g>
				</IconHelper>
			),
		},
		{
			name: 'textArea',
			displayName: 'Text Area',
			description: 'Text Area',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'buttonBar',
			displayName: 'Button Bar',
			description: 'Button Bar',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'button',
			displayName: 'Button',
			description: 'Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'resizer',
			displayName: 'Resizer',
			description: 'Resizer',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markdownContainer',
			displayName: 'Markdown Container',
			description: 'Markdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'em',
			displayName: 'Emphasised Text',
			description: 'Emphasised Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'b',
			displayName: 'Bold Text',
			description: 'Bold Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'mark',
			displayName: 'High Light Text',
			description: 'High Light Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 's',
			displayName: 'Strike Through Text',
			description: 'Strike Through Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sup',
			displayName: 'Super Script',
			description: 'Super Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sub',
			displayName: 'Sub Script',
			description: 'Sub Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ol',
			displayName: 'Ordered List',
			description: 'Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'oli',
			displayName: 'Ordered List Item',
			description: 'Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ul',
			displayName: 'Un Ordered List',
			description: 'Un Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ulli',
			displayName: 'Un Ordered List Item',
			description: 'Un Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tl',
			displayName: 'Task List',
			description: 'Task List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlli',
			displayName: 'Task List Item',
			description: 'Task List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlcheckbox',
			displayName: 'Task List Checkbox',
			description: 'Task List Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'links',
			displayName: 'Links',
			description: 'Links',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'linksHover',
			displayName: 'Links Hover',
			description: 'Links Hover',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'images',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icBlock',
			displayName: 'Inline Code Block',
			description: 'Inline Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlock',
			displayName: 'Code Block',
			description: 'Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockKeywords',
			displayName: 'Code Block Keywords',
			description: 'Code Block Keywords',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockVariables',
			displayName: 'Code Block Variables',
			description: 'Code Block Variables',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tables',
			displayName: 'Table',
			description: 'Table',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tablesHeader',
			displayName: 'Table Header',
			description: 'Table Header',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tablesRow',
			displayName: 'Table Row',
			description: 'Table Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tablesCell',
			displayName: 'Table Cell',
			description: 'Table Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'blockQuotes',
			displayName: 'Block Quote',
			description: 'Block Quote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hr',
			displayName: 'Horizontal Rule',
			description: 'Horizontal Rule',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'video',
			displayName: 'Video',
			description: 'Video',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
