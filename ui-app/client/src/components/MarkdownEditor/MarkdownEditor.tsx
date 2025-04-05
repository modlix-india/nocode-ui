import React, { useEffect, useRef, useState } from 'react';
import { MarkdownParser } from '../../commonComponents/Markdown/MarkdownParser';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { useStateCallback } from '../../util/useStateCallBack';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import MarkdownEditorStyle from './MarkdownEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './markdownEditorProperties';
import { styleDefaults } from './markdownEditorStyleProperties';
import { FilterPanelButtons } from './components/FilterPanelButtons';
import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import formatText from './utils/formatText';

function MarkdownEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { key: componentKey, bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: {
			readOnly,
			emptyStringValue,
			onChange,
			onBlur,
			editType,
			showPreviewFirst,
			pathForPastedFiles,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const editTypes = !editType?.length ? ['editText', 'editDoc'] : editType;
	const [mode, setMode] = useState(showPreviewFirst ? 'preview' : editTypes[0]);
	const [text, setText] = useState('');
	const [selectedText, setSelectedText] = useState('');
	const [finTextAreaWidth, setFinTextAreaWidth] = useState('100%');

	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, fromStore) => {
				setText((v: string) => {
					if (v === fromStore) return v;
					return fromStore ?? '';
				});
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, setText, textAreaRef.current]);

	const onChangeText = (newText: string, callback?: () => void) => {
		if (!bindingPathPath) return;

		setData(bindingPathPath, newText, context.pageName, true);
		if (callback) callback();

		if (!onChange) return;
		(async () =>
			await runEvent(
				onChange,
				onChange,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
	};

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const handleRichTextCommand = (
		command: string,
		value?: string | { url: string; text: string },
	) => {
		if (mode === 'editText' && textAreaRef.current) {
			const { selectionStart, selectionEnd } = textAreaRef.current;
			const { newText, newCursorPos } = formatText(
				text,
				command,
				{ start: selectionStart, end: selectionEnd },
				value,
			);

			onChangeText(newText, () => {
				textAreaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
			});
		} else {
			const { newText } = formatText(
				text,
				command,
				{ start: 0, end: text.length }, // Default to selecting all text
				value,
			);

			onChangeText(newText);
		}
	};

	const tabBar = (
		<div className="_tabBar" style={styleProperties.tabBar ?? {}}>
			<div
				className={`_tab _write ${mode === 'editText' ? '_active' : ''}`}
				onClick={() => setMode('editText')}
				style={styleProperties.tabButton ?? {}}
			>
				<svg width="15" height="15" viewBox="0 0 19 17" fill="none">
					<path
						d="M9.04913 2.25697C9.54593 1.71872 9.79433 1.4496 10.0583 1.29262C10.6951 0.91384 11.4794 0.90206 12.1269 1.26155C12.3953 1.41053 12.6513 1.67208 13.1633 2.19517C13.6754 2.71827 13.9315 2.97981 14.0773 3.25395C14.4292 3.91541 14.4177 4.71653 14.0469 5.36713C13.8932 5.63677 13.6297 5.89052 13.1029 6.398L6.83373 12.4362C5.83525 13.3979 5.336 13.8788 4.71204 14.1225C4.08808 14.3662 3.40213 14.3483 2.03024 14.3124L1.84359 14.3075C1.42594 14.2966 1.21711 14.2911 1.09573 14.1533C0.974334 14.0156 0.990907 13.8029 1.02405 13.3775L1.04205 13.1465C1.13534 11.949 1.18198 11.3503 1.41581 10.8121C1.64963 10.2739 2.05296 9.837 2.85962 8.963L9.04913 2.25697Z"
						fill="#016A70"
						fillOpacity="0.2"
						stroke="#016A70"
						strokeWidth="1.2"
						strokeLinejoin="round"
					/>
					<path d="M9 14.3335H14.3333H9Z" fill="black" />
					<path
						d="M9 14.3335H14.3333"
						stroke="#016A70"
						strokeWidth="1.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path d="M8.33301 2.3335L12.9997 7.00016L8.33301 2.3335Z" fill="white" />
					<path
						d="M8.33301 2.3335L12.9997 7.00016"
						stroke="#016A70"
						strokeWidth="1.2"
						strokeLinejoin="round"
					/>
				</svg>
				Write
			</div>
			<div className="_tabSeparator" style={styleProperties.tabSeparator ?? {}}></div>
			<div
				className={`_tab _doc ${mode === 'editDoc' ? '_active' : ''}`}
				onClick={() => setMode('editDoc')}
				style={styleProperties.tabButton ?? {}}
			>
				<svg width="17" height="17" viewBox="0 0 19 17" fill="none">
					<path
						d="M6.60102 14.6624H5.95523C3.61931 14.6624 2.45135 14.6624 1.72568 13.9253C1 13.1881 1 12.0017 1 9.62891V6.03352C1 3.66069 1 2.47428 1.72568 1.73715C2.45135 1 3.61931 1 5.95523 1H8.07887C10.4148 1 11.7794 1.03968 12.5052 1.77682C13.2309 2.51396 13.2243 3.66069 13.2243 6.03352V6.88664"
						fill="#FF3E3E"
						fillOpacity="0.2"
					/>
					<path
						d="M6.60102 14.6624H5.95523C3.61931 14.6624 2.45135 14.6624 1.72568 13.9253C1 13.1881 1 12.0017 1 9.62891V6.03352C1 3.66069 1 2.47428 1.72568 1.73715C2.45135 1 3.61931 1 5.95523 1H8.07887C10.4148 1 11.7794 1.03968 12.5052 1.77682C13.2309 2.51396 13.2243 3.66069 13.2243 6.03352V6.88664"
						stroke="#FF3E3E"
						strokeWidth="1.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M4.23584 9.65666H7.11214M4.23584 6.06128H9.98844"
						stroke="#FF3E3E"
						strokeWidth="1.2"
						strokeLinecap="round"
					/>
					<path
						opacity="0.93"
						d="M15.1305 10.5692C14.4795 9.83976 14.0889 9.88319 13.6548 10.0134C13.351 10.0569 12.3094 11.2727 11.8753 11.6598C11.1627 12.3639 10.4469 13.0887 10.3996 13.1832C10.2647 13.4026 10.1393 13.7912 10.0785 14.2253C9.96561 14.8767 9.80281 15.6099 10.009 15.6728C10.2152 15.7355 10.7902 15.6149 11.4413 15.5193C11.8753 15.4411 12.1791 15.3543 12.3962 15.2241C12.7 15.0417 13.2642 14.3991 14.2364 13.4438C14.8462 12.8018 15.4343 12.3582 15.608 11.924C15.7816 11.2727 15.5212 10.9253 15.1305 10.5692Z"
						stroke="#FF3E3E"
						strokeWidth="1.2"
					/>
				</svg>
				Document
			</div>
			<div className="_tabSeparator" style={styleProperties.tabSeparator ?? {}}></div>
			<div
				className={`_tab _preview ${mode === 'preview' ? '_active' : ''}`}
				onClick={() => setMode('preview')}
				style={styleProperties.tabButton ?? {}}
			>
				<svg width="18" height="16" viewBox="0 0 19 17" fill="none">
					<path
						d="M6.60412 14.67H5.95797C3.62076 14.67 2.45216 14.67 1.72608 13.9325C1 13.1949 1 12.0078 1 9.63369V6.03631C1 3.66217 1 2.4751 1.72608 1.73755C2.45216 1 3.62076 1 5.95797 1H8.08279C10.42 1 11.7854 1.0397 12.5116 1.77725C13.2377 2.5148 13.2311 3.66217 13.2311 6.03631V6.8899"
						fill="#3F4CC0"
						fillOpacity="0.2"
					/>
					<path
						d="M6.60412 14.67H5.95797C3.62076 14.67 2.45216 14.67 1.72608 13.9325C1 13.1949 1 12.0078 1 9.63369V6.03631C1 3.66217 1 2.4751 1.72608 1.73755C2.45216 1 3.62076 1 5.95797 1H8.08279C10.42 1 11.7854 1.0397 12.5116 1.77725C13.2377 2.5148 13.2311 3.66217 13.2311 6.03631V6.8899"
						stroke="#3F4CC0"
						strokeWidth="1.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M4.23779 9.66133H7.11569M4.23779 6.06396H9.99358"
						stroke="#3F4CC0"
						strokeWidth="1.2"
						strokeLinecap="round"
					/>
					<path
						d="M13.8711 12.1794H13.8771"
						stroke="#3F4CC0"
						strokeWidth="1.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M16.9614 11.8849C17.0598 12.0164 17.1091 12.0821 17.1091 12.1794C17.1091 12.2767 17.0598 12.3424 16.9614 12.4739C16.5192 13.0645 15.3896 14.3378 13.8714 14.3378C12.3533 14.3378 11.2237 13.0645 10.7814 12.4739C10.683 12.3424 10.6338 12.2767 10.6338 12.1794C10.6338 12.0821 10.683 12.0164 10.7814 11.8849C11.2237 11.2943 12.3533 10.021 13.8714 10.021C15.3896 10.021 16.5192 11.2943 16.9614 11.8849Z"
						stroke="#3F4CC0"
						strokeWidth="1.2"
					/>
				</svg>
				Preview
			</div>

			{mode == 'editText' && <FilterPanelButtons
				onFormatClick={handleRichTextCommand}
				isVisible={true}
				styleProperties={styleProperties}
				selectedText={selectedText}
			/>}
		</div>
	);

	const renderContent = () => {
		switch (mode) {
			case 'editText':
				return (
					<textarea
						ref={textAreaRef}
						value={text}
						style={{
							...(styleProperties.textArea ?? {}),
							width: finTextAreaWidth,
						}}
						onSelect={e => {
							const { selectionStart, selectionEnd } = textAreaRef.current!;
							setSelectedText(selectionStart == selectionEnd ? '' : text.substring(selectionStart, selectionEnd));
						}}
						onBlur={
							onBlur
								? () =>
									runEvent(
										undefined,
										onBlur,
										props.context.pageName,
										props.locationHistory,
										props.pageDefinition,
									)
								: undefined
						}
						onChange={ev => onChangeText(ev.target.value)}
						onKeyDown={ev => {
							if (ev.key === 'Tab') {
								ev.preventDefault();
								const { selectionStart, selectionEnd } = textAreaRef.current!;
								const newText = `${text.substring(0, selectionStart)}    ${text.substring(
									selectionEnd,
								)}`;
								onChangeText(newText, () =>
									textAreaRef.current!.setSelectionRange(
										selectionStart + 4,
										selectionStart + 4,
									),
								);
							}
						}}
						onPaste={ev => {
							ev.preventDefault();

							if (!textAreaRef.current) return;

							if (ev.clipboardData.files.length) {
								const file = ev.clipboardData.files[0];
								const formData = new FormData();
								formData.append('file', file);
								const fileNamePrefix = `pasted_${shortUUID()}_`;
								formData.append('name', fileNamePrefix);

								const headers: any = {
									Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
								};
								if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

								(async () => {
									try {
										let url = `/api/files/static/${pathForPastedFiles}`;
										let data = await axios.post(url, formData, {
											headers,
										});
										if (data.status === 200) {
											const { selectionStart, selectionEnd } = textAreaRef.current!;
											const paste = data.data.url;
											const newText = `${text.substring(0, selectionStart)}![](${paste})${text.substring(
												selectionEnd,
											)}`;
											onChangeText(newText, () =>
												textAreaRef.current!.setSelectionRange(
													selectionStart + paste.length + 4,
													selectionStart + paste.length + 4,
												),
											);
										}
									} catch (e) { }
								})();
							} else {
								const paste = ev.clipboardData.getData('text');
								const { selectionStart, selectionEnd } = textAreaRef.current!;
								const newText = `${text.substring(0, selectionStart)}${paste}${text.substring(
									selectionEnd,
								)}`;
								onChangeText(newText, () =>
									textAreaRef.current!.setSelectionRange(
										selectionStart + paste.length,
										selectionStart + paste.length,
									),
								);
							}
						}}
					/>
				);
			case 'editDoc':
				return (

					<MarkdownParser
						componentKey={componentKey}
						text={text}
						styles={styleProperties}
						editable={true}
						onChange={onChangeText}
					/>
				);
			case 'preview':
				return (
					<MarkdownParser
						componentKey={componentKey}
						text={text}
						styles={styleProperties}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div key={mode} className={`comp compMarkdownEditor`} style={styleProperties.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{tabBar}
			{renderContent()}
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
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="#834E63" />
					<path
						className="_MarkdownEditorMIcon"
						d="M13.5801 20.8509H16.7596V10H13.5697L10.3798 13.9887L7.18991 10H4V20.8509H7.20028V14.6267L10.3902 18.6153L13.5801 14.6267V20.8509Z"
						fill="white"
					/>
					<path
						className="_MarkdownEditorArrowIcon"
						d="M18 15.1421L22.5375 20.4366L27.07 15.1421H24.0467V10H21.0233V15.1421H18Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'tabBar',
			displayName: 'Tab Bar',
			description: 'Tab Bar',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabButton',
			displayName: 'Tab Button',
			description: 'Tab Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabSeparator',
			displayName: 'Tab Separator',
			description: 'Tab Separator',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'textArea',
			displayName: 'Text Area',
			description: 'Text Area',
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
			name: 'p',
			displayName: 'Paragraph',
			description: 'Paragraph',
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
			name: 'br',
			displayName: 'Line Break',
			description: 'Line Break',
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
			name: 'table',
			displayName: 'Table',
			description: 'Table',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'th',
			displayName: 'Table Header Cell',
			description: 'Table Header Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tr',
			displayName: 'Table Row',
			description: 'Table Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'td',
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
		{
			name: 'footNote',
			displayName: 'Footnote',
			description: 'Footnote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNoteLink',
			displayName: 'Footnote Link',
			description: 'Footnote Link',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
