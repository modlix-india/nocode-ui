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
import { EditorMode, MEButtonBar } from './components/MEButtonBar';
import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import { RichTextButtonBar } from './components/RichTextButtonBar';

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

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [mode, setMode] = useState<EditorMode>(editType ?? 'editText');
	const [text, setText] = useStateCallback<string>('');

	const textAreaRef = useRef<any>(null);
	const wrapperRef = useRef<any>(null);
	const resizerBarRef = useRef<any>(null);
	const [textAreaWidth, setTextAreaWidth] = useState<number>(0);

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
	}, [bindingPathPath, textAreaRef.current]);

	useEffect(() => setMode(editType), [editType]);

	useEffect(() => {
		if (!textAreaRef.current || !wrapperRef.current) return;

		const func = () => {
			if (!wrapperRef.current || !textAreaRef.current) return;
			wrapperRef.current.style.height = '100px';
			setTimeout(
				() =>
					(wrapperRef.current.style.height =
						textAreaRef.current.getBoundingClientRect().height + 'px'),
				600,
			);
		};
		window.addEventListener('resize', func);
		return () => window.removeEventListener('resize', func);
	}, [mode, textAreaRef.current, wrapperRef.current]);

	const onBlurEvent = onBlur ? props.pageDefinition.eventFunctions?.[onBlur] : undefined;
	const onChangeEvent = onChange ? props.pageDefinition.eventFunctions?.[onChange] : undefined;

	const onChangeText = (editedText: string, callBack?: () => void) => {
		if (!bindingPathPath) return;
		setText(editedText, callBack);
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

	let renderingComponent = undefined;

	let showBoth = false;
	if (readOnly) {
		renderingComponent = mode.includes('HTML') ? (
			<div className="_html-content" dangerouslySetInnerHTML={{ __html: text }} />
		) : (
			<MarkdownParser componentKey={componentKey} text={text} styles={styleProperties} />
		);
	} else {
		const showText = mode.indexOf('Text') !== -1 || mode.indexOf('HTML') !== -1;
		const showDoc = mode.indexOf('Doc') !== -1;
		const isHTML = mode.indexOf('HTML') !== -1;
		showBoth = showText && showDoc;
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
								fontFamily: isHTML ? 'monospace' : undefined,
							}
						: {
								width: finTextAreaWidth,
								fontFamily: isHTML ? 'monospace' : undefined,
							}
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
				onKeyUp={() => scrollToCaret(textAreaRef, componentKey)}
				onClick={() => scrollToCaret(textAreaRef, componentKey)}
				onScroll={() => {
					if (!textAreaRef.current) return;

					scrollToCaret(
						textAreaRef,
						componentKey,
						Math.round(
							(textAreaRef.current.value.split('\n').length *
								textAreaRef.current.scrollTop) /
								textAreaRef.current.scrollHeight,
						),
					);
				}}
				onKeyDown={ev => {
					if (ev.key === 'Tab') {
						ev.preventDefault();
						const { selectionStart, selectionEnd } = textAreaRef.current;
						const newText = `${text.substring(0, selectionStart)}    ${text.substring(
							selectionEnd,
						)}`;

						onChangeText(newText, () =>
							textAreaRef.current.setSelectionRange(
								selectionStart + 4,
								selectionStart + 4,
							),
						);
					}
				}}
				onPaste={ev => {
					ev.preventDefault();

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
									const { selectionStart, selectionEnd } = textAreaRef.current;
									const paste = data.data.url;
									const newText = `${text.substring(0, selectionStart)}![](${paste})${text.substring(
										selectionEnd,
									)}`;
									onChangeText(newText, () =>
										textAreaRef.current.setSelectionRange(
											selectionStart + paste + 5,
											selectionStart + paste + 5,
										),
									);
								}
							} catch (e) {}
						})();
					} else {
						const paste = ev.clipboardData.getData('text');
						const { selectionStart, selectionEnd } = textAreaRef.current;
						const newText = `${text.substring(0, selectionStart)}${paste}${text.substring(
							selectionEnd,
						)}`;

						onChangeText(newText, () =>
							textAreaRef.current.setSelectionRange(
								selectionStart + paste.length,
								selectionStart + paste.length,
							),
						);
					}
				}}
			/>
		) : undefined;

		let docComp = showDoc ? (
			isHTML ? (
				<div className="_html-preview">
					<div dangerouslySetInnerHTML={{ __html: text }} />
				</div>
			) : (
				<MarkdownParser
					componentKey={componentKey}
					text={text}
					styles={styleProperties}
					editable={true}
					onChange={onChangeText}
					className={showBoth ? '_both' : ''}
				/>
			)
		) : undefined;

		if (showBoth) {
			docComp = (
				<div
					className="_wrapper"
					ref={x => {
						wrapperRef.current = x;
						if (!x || !textAreaRef.current) return;
						x.style.height = textAreaRef.current.getBoundingClientRect().height + 'px';
					}}
				>
					{docComp}
				</div>
			);
		}

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

	if (textAreaRef.current)
		textAreaRef.current.style.height = showBoth
			? '100%'
			: textAreaRef.current.scrollHeight + 'px';

	let buttonBar = undefined;

	// const handleKeyboardShortcut = (ev: KeyboardEvent) => {
	// 	if (!textAreaRef.current) return;
	// 	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	// 	const modifier = isMac ? ev.metaKey : ev.ctrlKey;

	// 	if (modifier) {
	// 		switch (ev.key.toLowerCase()) {
	// 			case 'b':
	// 				ev.preventDefault();
	// 				handleRichTextCommand('bold');
	// 				break;
	// 			case 'i':
	// 				ev.preventDefault();
	// 				handleRichTextCommand('italic');
	// 				break;
	// 			case 'u':
	// 				ev.preventDefault();
	// 				handleRichTextCommand('underline');
	// 				break;
	// 			case 'h':
	// 				ev.preventDefault();
	// 				handleRichTextCommand('h1');
	// 				break;
	// 		}
	// 	}
	// };

	useEffect(() => {
		if (!textAreaRef.current) return;
		textAreaRef.current.style.height = '100%';
	}, [text]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyboardShortcut);
		return () => document.removeEventListener('keydown', handleKeyboardShortcut);
	}, [text]);

	const handleKeyboardShortcut = (ev: KeyboardEvent) => {
		if (!textAreaRef.current) return;
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const modifier = isMac ? ev.metaKey : ev.ctrlKey;

		if (modifier) {
			switch (ev.key.toLowerCase()) {
				case 'b':
					ev.preventDefault();
					handleRichTextCommand('bold');
					break;
				case 'i':
					ev.preventDefault();
					handleRichTextCommand('italic');
					break;
				case 'u':
					ev.preventDefault();
					handleRichTextCommand('underline');
					break;
				case 'k':
					ev.preventDefault();
					// Open link dialog when Ctrl+K is pressed
					if (textAreaRef.current) {
						const selectedText = textAreaRef.current.value.substring(
							textAreaRef.current.selectionStart,
							textAreaRef.current.selectionEnd,
						);
						handleRichTextCommand('link', { url: '', text: selectedText });
					}
					break;
				case '.':
					if (ev.shiftKey) {
						ev.preventDefault();
						handleRichTextCommand('superscript');
					}
					break;
				case ',':
					if (ev.shiftKey) {
						ev.preventDefault();
						handleRichTextCommand('subscript');
					}
					break;
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
					if (ev.altKey) {
						ev.preventDefault();
						handleRichTextCommand(`h${ev.key}`);
					}
					break;
			}
		}
	};

	const handleRichTextCommand = (
		command: string,
		value?: string | { url: string; text: string },
	) => {
		if (!textAreaRef.current) return;

		const { selectionStart, selectionEnd } = textAreaRef.current;
		const selectedText = text.substring(selectionStart, selectionEnd);
		const beforeText = text.substring(0, selectionStart);
		const afterText = text.substring(selectionEnd);

		let newText = text;
		let newCursorPos = selectionEnd;

		switch (command) {
			case 'bold':
				if (mode.includes('HTML')) {
					const hasBoldTag = selectedText.match(/<strong>(.*?)<\/strong>/);
					if (hasBoldTag) {
						newText =
							beforeText +
							selectedText.replace(/<strong>(.*?)<\/strong>/, '$1') +
							afterText;
						newCursorPos =
							selectionStart +
							selectedText.replace(/<strong>(.*?)<\/strong>/, '$1').length;
					} else {
						newText = `${beforeText}<strong>${selectedText}</strong>${afterText}`;
						newCursorPos = selectionEnd + 17;
					}
				} else {
					const hasBoldMarkers =
						selectedText.startsWith('**') && selectedText.endsWith('**');
					if (hasBoldMarkers) {
						newText = beforeText + selectedText.slice(2, -2) + afterText;
						newCursorPos = selectionEnd - 4;
					} else {
						newText = `${beforeText}**${selectedText}**${afterText}`;
						newCursorPos = selectionEnd + 4;
					}
				}
				break;

			case 'italic':
				if (mode.includes('HTML')) {
					const hasItalicTag = selectedText.match(/<em>(.*?)<\/em>/);
					if (hasItalicTag) {
						newText =
							beforeText + selectedText.replace(/<em>(.*?)<\/em>/, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(/<em>(.*?)<\/em>/, '$1').length;
					} else {
						newText = `${beforeText}<em>${selectedText}</em>${afterText}`;
						newCursorPos = selectionEnd + 9;
					}
				} else {
					const hasItalicMarkers =
						selectedText.startsWith('*') && selectedText.endsWith('*');
					if (hasItalicMarkers) {
						newText = beforeText + selectedText.slice(1, -1) + afterText;
						newCursorPos = selectionEnd - 2;
					} else {
						newText = `${beforeText}*${selectedText}*${afterText}`;
						newCursorPos = selectionEnd + 2;
					}
				}
				break;

			case 'underline':
				if (mode.includes('HTML')) {
					const hasUnderlineTag = selectedText.match(/<u>(.*?)<\/u>/);
					if (hasUnderlineTag) {
						newText =
							beforeText + selectedText.replace(/<u>(.*?)<\/u>/, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(/<u>(.*?)<\/u>/, '$1').length;
					} else {
						newText = `${beforeText}<u>${selectedText}</u>${afterText}`;
						newCursorPos = selectionEnd + 7;
					}
				} else {
					// In Markdown, we use HTML tags for underline since Markdown doesn't have native underline syntax
					const hasUnderlineTag = selectedText.match(/<u>(.*?)<\/u>/);
					if (hasUnderlineTag) {
						newText =
							beforeText + selectedText.replace(/<u>(.*?)<\/u>/, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(/<u>(.*?)<\/u>/, '$1').length;
					} else {
						newText = `${beforeText}<u>${selectedText}</u>${afterText}`;
						newCursorPos = selectionEnd + 7;
					}
				}
				break;

			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				const headingLevel = command.charAt(1);
				if (mode.includes('HTML')) {
					const headingTagRegex = new RegExp(
						`<h${headingLevel}>(.*?)<\\/h${headingLevel}>`,
						'i',
					);
					if (selectedText.match(headingTagRegex)) {
						newText =
							beforeText + selectedText.replace(headingTagRegex, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(headingTagRegex, '$1').length;
					} else {
						// Remove any existing heading tags first
						const cleanText = selectedText.replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, '$1');
						newText = `${beforeText}<h${headingLevel}>${cleanText}</h${headingLevel}>${afterText}`;
						newCursorPos = selectionEnd + headingLevel.length * 2 + 5;
					}
				} else {
					// Markdown heading implementation
					const headingMarker = '#'.repeat(Number(headingLevel));
					const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
					const lineEnd =
						text.indexOf('\n', selectionEnd) === -1
							? text.length
							: text.indexOf('\n', selectionEnd);
					const currentLine = text.substring(lineStart, lineEnd);

					if (currentLine.startsWith(headingMarker + ' ')) {
						newText =
							text.substring(0, lineStart) +
							currentLine.substring(headingMarker.length + 1) +
							text.substring(lineEnd);
					} else {
						const cleanLine = currentLine.replace(/^#+\s*/, '');
						newText =
							text.substring(0, lineStart) +
							`${headingMarker} ${cleanLine}` +
							text.substring(lineEnd);
					}
				}
				break;

			case 'color':
				if (selectedText.match(/<span style="color: #[0-9a-f]{6}">(.*?)<\/span>/)) {
					newText =
						beforeText +
						selectedText.replace(
							/<span style="color: #[0-9a-f]{6}">(.*?)<\/span>/,
							'$1',
						) +
						afterText;
					newCursorPos =
						selectionStart +
						selectedText.replace(
							/<span style="color: #[0-9a-f]{6}">(.*?)<\/span>/,
							'$1',
						).length;
				} else {
					newText = `${beforeText}<span style="color: #ff0000">${selectedText}</span>${afterText}`;
					newCursorPos = selectionEnd + 32;
				}
				break;

			case 'highlight':
				if (selectedText.match(/<mark>(.*?)<\/mark>/)) {
					newText =
						beforeText + selectedText.replace(/<mark>(.*?)<\/mark>/, '$1') + afterText;
					newCursorPos =
						selectionStart + selectedText.replace(/<mark>(.*?)<\/mark>/, '$1').length;
				} else {
					newText = `${beforeText}<mark>${selectedText}</mark>${afterText}`;
					newCursorPos = selectionEnd + 13;
				}
				break;

			case 'link':
				if (typeof value === 'object' && 'url' in value) {
					if (mode.includes('HTML')) {
						newText = `${beforeText}<a href="${value.url}">${value.text}</a>${afterText}`;
						newCursorPos = selectionStart + value.text.length + value.url.length + 15;
					} else {
						newText = `${beforeText}[${value.text}](${value.url})${afterText}`;
						newCursorPos = selectionStart + value.text.length + value.url.length + 4;
					}
				}
				break;

			case 'image':
				if (typeof value === 'string') {
					if (mode.includes('HTML')) {
						newText = `${beforeText}<img src="${value}" alt="" />${afterText}`;
						newCursorPos = selectionStart + value.length + 18;
					} else {
						newText = `${beforeText}![](${value})${afterText}`;
						newCursorPos = selectionStart + value.length + 4;
					}
				}
				break;

			case 'ul':
				if (mode.includes('HTML')) {
					const lines = selectedText.split('\n');
					const listItems = lines
						.map(line => (line.trim() ? `<li>${line.trim()}</li>` : ''))
						.filter(Boolean);
					if (listItems.length) {
						const formattedList = `<ul>\n  ${listItems.join('\n  ')}\n</ul>`;
						newText = beforeText + formattedList + afterText;
						newCursorPos = selectionStart + formattedList.length;
					}
				} else {
					newText = insertList(text, selectionStart, selectionEnd, '*');
				}
				break;

			case 'ol':
				if (mode.includes('HTML')) {
					const lines = selectedText.split('\n');
					const listItems = lines
						.map(line => (line.trim() ? `<li>${line.trim()}</li>` : ''))
						.filter(Boolean);
					if (listItems.length) {
						const formattedList = `<ol>\n  ${listItems.join('\n  ')}\n</ol>`;
						newText = beforeText + formattedList + afterText;
						newCursorPos = selectionStart + formattedList.length;
					}
				} else {
					newText = insertList(text, selectionStart, selectionEnd, '1.');
				}
				break;

			case 'quote':
				if (mode.includes('HTML')) {
					const hasBlockquote = selectedText.match(/<blockquote>(.*?)<\/blockquote>/s);
					if (hasBlockquote) {
						newText =
							beforeText +
							selectedText.replace(/<blockquote>(.*?)<\/blockquote>/s, '$1') +
							afterText;
						newCursorPos =
							selectionStart +
							selectedText.replace(/<blockquote>(.*?)<\/blockquote>/s, '$1').length;
					} else {
						newText = `${beforeText}<blockquote>${selectedText}</blockquote>${afterText}`;
						newCursorPos = selectionEnd + 25;
					}
				} else {
					newText = insertPrefix(text, selectionStart, selectionEnd, '>');
				}
				break;

			case 'superscript':
				if (selectedText.match(/<sup>(.*?)<\/sup>/)) {
					newText =
						beforeText + selectedText.replace(/<sup>(.*?)<\/sup>/, '$1') + afterText;
					newCursorPos =
						selectionStart + selectedText.replace(/<sup>(.*?)<\/sup>/, '$1').length;
				} else {
					newText = `${beforeText}<sup>${selectedText}</sup>${afterText}`;
					newCursorPos = selectionEnd + 11;
				}
				break;

			case 'subscript':
				if (selectedText.match(/<sub>(.*?)<\/sub>/)) {
					newText =
						beforeText + selectedText.replace(/<sub>(.*?)<\/sub>/, '$1') + afterText;
					newCursorPos =
						selectionStart + selectedText.replace(/<sub>(.*?)<\/sub>/, '$1').length;
				} else {
					newText = `${beforeText}<sub>${selectedText}</sub>${afterText}`;
					newCursorPos = selectionEnd + 11;
				}
				break;

			case 'strikethrough':
				if (mode.includes('HTML')) {
					if (selectedText.match(/<s>(.*?)<\/s>/)) {
						newText =
							beforeText + selectedText.replace(/<s>(.*?)<\/s>/, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(/<s>(.*?)<\/s>/, '$1').length;
					} else {
						newText = `${beforeText}<s>${selectedText}</s>${afterText}`;
						newCursorPos = selectionEnd + 7;
					}
				} else {
					if (selectedText.match(/~~(.*?)~~/)) {
						newText = beforeText + selectedText.replace(/~~(.*?)~~/, '$1') + afterText;
						newCursorPos =
							selectionStart + selectedText.replace(/~~(.*?)~~/, '$1').length;
					} else {
						newText = `${beforeText}~~${selectedText}~~${afterText}`;
						newCursorPos = selectionEnd + 4;
					}
				}
				break;

			case 'fontFamily':
				if (selectedText.match(/<span style="font-family:[^"]*">(.*?)<\/span>/)) {
					newText =
						beforeText +
						selectedText.replace(
							/<span style="font-family:[^"]*">(.*?)<\/span>/,
							'$1',
						) +
						afterText;
					newCursorPos =
						selectionStart +
						selectedText.replace(/<span style="font-family:[^"]*">(.*?)<\/span>/, '$1')
							.length;
				} else {
					newText = `${beforeText}<span style="font-family: ${value}">${selectedText}</span>${afterText}`;
					newCursorPos = selectionEnd + 20 + String(value).length + 12;
				}
				break;

			case 'fontSize':
				if (selectedText.match(/<span style="font-size:[^"]*">(.*?)<\/span>/)) {
					newText =
						beforeText +
						selectedText.replace(/<span style="font-size:[^"]*">(.*?)<\/span>/, '$1') +
						afterText;
					newCursorPos =
						selectionStart +
						selectedText.replace(/<span style="font-size:[^"]*">(.*?)<\/span>/, '$1')
							.length;
				} else {
					newText = `${beforeText}<span style="font-size: ${value}">${selectedText}</span>${afterText}`;
					newCursorPos = selectionEnd + 18 + String(value).length + 12;
				}
				break;

			case 'align':
				if (selectedText.match(/<div style="text-align:[^"]*">(.*?)<\/div>/s)) {
					newText =
						beforeText +
						selectedText.replace(/<div style="text-align:[^"]*">(.*?)<\/div>/s, '$1') +
						afterText;
					newCursorPos =
						selectionStart +
						selectedText.replace(/<div style="text-align:[^"]*">(.*?)<\/div>/s, '$1')
							.length;
				} else {
					newText = `${beforeText}<div style="text-align: ${value}">${selectedText}</div>${afterText}`;
					newCursorPos = selectionEnd + 19 + String(value).length + 12;
				}
				break;

			case 'direction':
				if (selectedText.match(/<div dir="[^"]*">(.*?)<\/div>/s)) {
					newText =
						beforeText +
						selectedText.replace(/<div dir="[^"]*">(.*?)<\/div>/s, '$1') +
						afterText;
					newCursorPos =
						selectionStart +
						selectedText.replace(/<div dir="[^"]*">(.*?)<\/div>/s, '$1').length;
				} else {
					newText = `${beforeText}<div dir="${value}">${selectedText}</div>${afterText}`;
					newCursorPos = selectionEnd + 10 + String(value).length + 12;
				}
				break;

			case 'indent':
				if (mode.includes('HTML')) {
					// In HTML mode, add padding-left
					if (selectedText.match(/<div style="padding-left:[^"]*">(.*?)<\/div>/s)) {
						const currentPadding = selectedText.match(
							/<div style="padding-left:(\d+)px">/,
						)?.[1];
						let newPadding = 0;
						if (currentPadding) {
							newPadding =
								value === 'increase'
									? parseInt(currentPadding) + 20
									: Math.max(0, parseInt(currentPadding) - 20);
						} else {
							newPadding = value === 'increase' ? 20 : 0;
						}

						if (newPadding > 0) {
							newText =
								beforeText +
								selectedText.replace(
									/<div style="padding-left:[^"]*">(.*?)<\/div>/s,
									`<div style="padding-left:${newPadding}px">$1</div>`,
								) +
								afterText;
						} else {
							newText =
								beforeText +
								selectedText.replace(
									/<div style="padding-left:[^"]*">(.*?)<\/div>/s,
									'$1',
								) +
								afterText;
						}
					} else if (value === 'increase') {
						newText = `${beforeText}<div style="padding-left:20px">${selectedText}</div>${afterText}`;
					} else {
						newText = beforeText + selectedText + afterText;
					}
				} else {
					// Markdown mode - use spaces for indentation
					const indentSize = value === 'increase' ? 2 : -2;
					const lines = selectedText.split('\n');
					const indentedLines = lines.map(line => {
						if (value === 'increase') {
							return '  ' + line;
						} else {
							return line.replace(/^  /, '');
						}
					});
					newText = beforeText + indentedLines.join('\n') + afterText;
				}
				break;

			case 'code':
				if (mode.includes('HTML')) {
					if (selectedText.includes('\n')) {
						if (selectedText.match(/<pre><code>(.*?)<\/code><\/pre>/s)) {
							newText =
								beforeText +
								selectedText.replace(/<pre><code>(.*?)<\/code><\/pre>/s, '$1') +
								afterText;
						} else {
							newText = `${beforeText}<pre><code>${selectedText}</code></pre>${afterText}`;
						}
					} else {
						if (selectedText.match(/<code>(.*?)<\/code>/)) {
							newText =
								beforeText +
								selectedText.replace(/<code>(.*?)<\/code>/, '$1') +
								afterText;
						} else {
							newText = `${beforeText}<code>${selectedText}</code>${afterText}`;
						}
					}
				} else {
					if (selectedText.includes('\n')) {
						if (selectedText.match(/```\n(.*?)\n```/s)) {
							newText =
								beforeText +
								selectedText.replace(/```\n(.*?)\n```/s, '$1') +
								afterText;
						} else {
							newText = `${beforeText}\`\`\`\n${selectedText}\n\`\`\`${afterText}`;
						}
						newCursorPos = selectionEnd + 8;
					} else {
						if (selectedText.match(/`(.*?)`/)) {
							newText =
								beforeText + selectedText.replace(/`(.*?)`/, '$1') + afterText;
						} else {
							newText = `${beforeText}\`${selectedText}\`${afterText}`;
						}
						newCursorPos = selectionEnd + 2;
					}
				}
				break;

			case 'hr':
				if (mode.includes('HTML')) {
					newText = `${beforeText}\n<hr />\n${afterText}`;
					newCursorPos = selectionStart + 8;
				} else {
					newText = `${beforeText}\n---\n${afterText}`;
					newCursorPos = selectionStart + 5;
				}
				break;

			case 'clearFormat':
				// Remove both HTML tags and Markdown formatting characters
				let cleanText = selectedText
					.replace(/<[^>]+>/g, '') // Remove HTML tags
					.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2') // Remove bold
					.replace(/(\*|_)(.*?)(\*|_)/g, '$2') // Remove italic
					.replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
					.replace(/`(.*?)`/g, '$1') // Remove inline code
					.replace(/```(.*?)```/g, '$1') // Remove code blocks
					.replace(/^\s*[#]{1,6}\s+/gm, '') // Remove heading markers
					.replace(/^\s*[-+*]\s+/gm, '') // Remove unordered list markers
					.replace(/^\s*\d+\.\s+/gm, '') // Remove ordered list markers
					.replace(/^\s*>\s+/gm, ''); // Remove blockquote markers

				newText = beforeText + cleanText + afterText;
				newCursorPos = selectionStart + cleanText.length;
				break;
		}

		onChangeText(newText, () => {
			textAreaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
		});
	};

	// const handleRichTextCommand = (
	// 	command: string,
	// 	value?: string | { url: string; text: string },
	// ) => {
	// 	if (!textAreaRef.current) return;

	// 	const { selectionStart, selectionEnd } = textAreaRef.current;
	// 	const selectedText = text.substring(selectionStart, selectionEnd);
	// 	const beforeText = text.substring(0, selectionStart);
	// 	const afterText = text.substring(selectionEnd);

	// 	let newText = text;
	// 	let newCursorPos = selectionEnd;

	// 	switch (command) {
	// 		case 'bold':
	// 			const hasBoldMarkers = selectedText.startsWith('**') && selectedText.endsWith('**');
	// 			const hasBoldTag = selectedText.match(/<strong>(.*?)<\/strong>/);

	// 			if (hasBoldMarkers) {
	// 				newText = beforeText + selectedText.slice(2, -2) + afterText;
	// 				newCursorPos = selectionEnd - 4;
	// 			} else if (hasBoldTag) {
	// 				newText =
	// 					beforeText +
	// 					selectedText.replace(/<strong>(.*?)<\/strong>/, '$1') +
	// 					afterText;
	// 				newCursorPos =
	// 					selectionStart +
	// 					selectedText.replace(/<strong>(.*?)<\/strong>/, '$1').length;
	// 			} else {
	// 				newText = `${beforeText}**${selectedText}**${afterText}`;
	// 				newCursorPos = selectionEnd + 4;
	// 			}
	// 			break;

	// 		case 'italic':
	// 			const hasItalicMarkers = selectedText.startsWith('*') && selectedText.endsWith('*');
	// 			const hasItalicTag = selectedText.match(/<em>(.*?)<\/em>/);

	// 			if (hasItalicMarkers) {
	// 				newText = beforeText + selectedText.slice(1, -1) + afterText;
	// 				newCursorPos = selectionEnd - 2;
	// 			} else if (hasItalicTag) {
	// 				newText =
	// 					beforeText + selectedText.replace(/<em>(.*?)<\/em>/, '$1') + afterText;
	// 				newCursorPos =
	// 					selectionStart + selectedText.replace(/<em>(.*?)<\/em>/, '$1').length;
	// 			} else {
	// 				newText = `${beforeText}*${selectedText}*${afterText}`;
	// 				newCursorPos = selectionEnd + 2;
	// 			}
	// 			break;

	// 		// case 'underline':
	// 		// 	const hasUnderlineMarkers =
	// 		// 		selectedText.startsWith('__') && selectedText.endsWith('__');
	// 		// 	const hasUnderlineTag = selectedText.match(/<u>(.*?)<\/u>/);

	// 		// 	if (hasUnderlineMarkers) {
	// 		// 		newText = beforeText + selectedText.slice(2, -2) + afterText;
	// 		// 		newCursorPos = selectionEnd - 4;
	// 		// 	} else if (hasUnderlineTag) {
	// 		// 		newText = beforeText + selectedText.replace(/<u>(.*?)<\/u>/, '$1') + afterText;
	// 		// 		newCursorPos =
	// 		// 			selectionStart + selectedText.replace(/<u>(.*?)<\/u>/, '$1').length;
	// 		// 	} else {
	// 		// 		newText = `${beforeText}__${selectedText}__${afterText}`;
	// 		// 		newCursorPos = selectionEnd + 4;
	// 		// 	}
	// 		// 	break;

	// 		case 'h1':
	// 		case 'h2':
	// 		case 'h3':
	// 		case 'h4':
	// 		case 'h5':
	// 		case 'h6':
	// 			const headingLevel = command.charAt(1);
	// 			const headingMarker = '#'.repeat(Number(headingLevel));
	// 			const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
	// 			const lineEnd =
	// 				text.indexOf('\n', selectionEnd) === -1
	// 					? text.length
	// 					: text.indexOf('\n', selectionEnd);
	// 			const currentLine = text.substring(lineStart, lineEnd);

	// 			if (currentLine.startsWith(headingMarker + ' ')) {
	// 				newText =
	// 					text.substring(0, lineStart) +
	// 					currentLine.substring(headingMarker.length + 1) +
	// 					text.substring(lineEnd);
	// 			} else {
	// 				const cleanLine = currentLine.replace(/^#+\s*/, '');
	// 				newText =
	// 					text.substring(0, lineStart) +
	// 					`${headingMarker} ${cleanLine}` +
	// 					text.substring(lineEnd);
	// 			}
	// 			break;

	// 		case 'color':
	// 			if (selectedText.match(/<span style="color: #[0-9a-f]{6}">(.*?)<\/span>/)) {
	// 				newText =
	// 					text.substring(0, selectionStart) +
	// 					selectedText.replace(
	// 						/<span style="color: #[0-9a-f]{6}">(.*?)<\/span>/,
	// 						'$1',
	// 					) +
	// 					text.substring(selectionEnd);
	// 			} else {
	// 				newText = `${text.substring(0, selectionStart)}<span style="color: #ff0000">${selectedText}</span>${text.substring(selectionEnd)}`;
	// 				newCursorPos = selectionEnd + 32;
	// 			}
	// 			break;

	// 		case 'highlight':
	// 			if (selectedText.match(/<mark>(.*?)<\/mark>/)) {
	// 				newText =
	// 					text.substring(0, selectionStart) +
	// 					selectedText.replace(/<mark>(.*?)<\/mark>/, '$1') +
	// 					text.substring(selectionEnd);
	// 			} else {
	// 				newText = `${text.substring(0, selectionStart)}<mark>${selectedText}</mark>${text.substring(selectionEnd)}`;
	// 				newCursorPos = selectionEnd + 13;
	// 			}
	// 			break;

	// 		case 'link':
	// 			if (typeof value === 'object' && 'url' in value) {
	// 				newText = `${text.substring(0, selectionStart)}[${value.text}](${value.url})${text.substring(selectionEnd)}`;
	// 				newCursorPos = selectionStart + value.text.length + value.url.length + 4;
	// 			}
	// 			break;

	// 		case 'image':
	// 			if (typeof value === 'string') {
	// 				newText = `${text.substring(0, selectionStart)}![](${value})${text.substring(selectionEnd)}`;
	// 				newCursorPos = selectionStart + value.length + 4;
	// 			}
	// 			break;

	// 		case 'ul':
	// 			newText = insertList(text, selectionStart, selectionEnd, '*');
	// 			break;

	// 		case 'ol':
	// 			newText = insertList(text, selectionStart, selectionEnd, '1.');
	// 			break;

	// 		case 'quote':
	// 			newText = insertPrefix(text, selectionStart, selectionEnd, '>');
	// 			break;

	// 		case 'superscript':
	// 			if (selectedText.match(/<sup>(.*?)<\/sup>/)) {
	// 				newText =
	// 					beforeText + selectedText.replace(/<sup>(.*?)<\/sup>/, '$1') + afterText;
	// 				newCursorPos =
	// 					selectionStart + selectedText.replace(/<sup>(.*?)<\/sup>/, '$1').length;
	// 			} else {
	// 				newText = `${beforeText}<sup>${selectedText}</sup>${afterText}`;
	// 				newCursorPos = selectionEnd + 11;
	// 			}
	// 			break;

	// 		case 'subscript':
	// 			if (selectedText.match(/<sub>(.*?)<\/sub>/)) {
	// 				newText =
	// 					beforeText + selectedText.replace(/<sub>(.*?)<\/sub>/, '$1') + afterText;
	// 				newCursorPos =
	// 					selectionStart + selectedText.replace(/<sub>(.*?)<\/sub>/, '$1').length;
	// 			} else {
	// 				newText = `${beforeText}<sub>${selectedText}</sub>${afterText}`;
	// 				newCursorPos = selectionEnd + 11;
	// 			}
	// 			break;

	// 		case 'strikethrough':
	// 			if (selectedText.match(/~~(.*?)~~/)) {
	// 				newText = beforeText + selectedText.replace(/~~(.*?)~~/, '$1') + afterText;
	// 				newCursorPos = selectionStart + selectedText.replace(/~~(.*?)~~/, '$1').length;
	// 			} else {
	// 				newText = `${beforeText}~~${selectedText}~~${afterText}`;
	// 				newCursorPos = selectionEnd + 4;
	// 			}
	// 			break;

	// 		case 'fontFamily':
	// 			if (selectedText.match(/<span style="font-family:[^"]*">(.*?)<\/span>/)) {
	// 				newText =
	// 					beforeText +
	// 					selectedText.replace(
	// 						/<span style="font-family:[^"]*">(.*?)<\/span>/,
	// 						'$1',
	// 					) +
	// 					afterText;
	// 			} else {
	// 				newText = `${beforeText}<span style="font-family: ${value}">${selectedText}</span>${afterText}`;
	// 			}
	// 			break;

	// 		case 'fontSize':
	// 			if (selectedText.match(/<span style="font-size:[^"]*">(.*?)<\/span>/)) {
	// 				newText =
	// 					beforeText +
	// 					selectedText.replace(/<span style="font-size:[^"]*">(.*?)<\/span>/, '$1') +
	// 					afterText;
	// 			} else {
	// 				newText = `${beforeText}<span style="font-size: ${value}">${selectedText}</span>${afterText}`;
	// 			}
	// 			break;

	// 		case 'align':
	// 			if (selectedText.match(/<div style="text-align:[^"]*">(.*?)<\/div>/)) {
	// 				newText =
	// 					beforeText +
	// 					selectedText.replace(/<div style="text-align:[^"]*">(.*?)<\/div>/, '$1') +
	// 					afterText;
	// 			} else {
	// 				newText = `${beforeText}<div style="text-align: ${value}">${selectedText}</div>${afterText}`;
	// 			}
	// 			break;

	// 		case 'direction':
	// 			if (selectedText.match(/<div dir="[^"]*">(.*?)<\/div>/)) {
	// 				newText =
	// 					beforeText +
	// 					selectedText.replace(/<div dir="[^"]*">(.*?)<\/div>/, '$1') +
	// 					afterText;
	// 			} else {
	// 				newText = `${beforeText}<div dir="${value}">${selectedText}</div>${afterText}`;
	// 			}
	// 			break;

	// 		case 'indent':
	// 			const indentSize = value === 'increase' ? 2 : -2;
	// 			const lines = selectedText.split('\n');
	// 			const indentedLines = lines.map(line => {
	// 				if (value === 'increase') {
	// 					return '  ' + line;
	// 				} else {
	// 					return line.replace(/^  /, '');
	// 				}
	// 			});
	// 			newText = beforeText + indentedLines.join('\n') + afterText;
	// 			break;

	// 		case 'code':
	// 			if (selectedText.includes('\n')) {
	// 				newText = `${beforeText}\`\`\`\n${selectedText}\n\`\`\`${afterText}`;
	// 				newCursorPos = selectionEnd + 8;
	// 			} else {
	// 				newText = `${beforeText}\`${selectedText}\`${afterText}`;
	// 				newCursorPos = selectionEnd + 2;
	// 			}
	// 			break;

	// 		case 'hr':
	// 			newText = `${beforeText}\n---\n${afterText}`;
	// 			newCursorPos = selectionStart + 5;
	// 			break;

	// 		case 'clearFormat':
	// 			newText = beforeText + selectedText.replace(/<[^>]+>/g, '') + afterText;
	// 			newCursorPos = selectionStart + selectedText.replace(/<[^>]+>/g, '').length;
	// 			break;
	// 	}

	// 	onChangeText(newText, () => {
	// 		textAreaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
	// 	});
	// };

	if (!readOnly) {
		buttonBar = (
			<>
				<MEButtonBar
					mode={mode}
					onModeChange={m => {
						setMode(m);
						if (m.includes('RichText')) {
							setShowRichTextBar(true);
						}
					}}
					styleProperties={styleProperties}
					textAreaRef={textAreaRef.current}
					onFileSelected={(s, e, file) => {
						let newText = makeTextForImageSelection(text, s, e, file);
						onChangeText(newText, () => {
							textAreaRef.current.setSelectionRange(s, s + file.length);
						});
					}}
				/>
				{mode.includes('RichText') && (
					<RichTextButtonBar
						onCommand={handleRichTextCommand}
						textAreaRef={textAreaRef.current}
					/>
				)}
			</>
		);
	}

	return (
		<div
			key={mode}
			className={`comp compMarkdownEditor ${showBoth ? '_both' : ''}`}
			style={styleProperties.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			{buttonBar}
			<div className="_editorContainer">{renderingComponent}</div>
		</div>
	);
}

function scrollToCaret(textAreaRef: any, componentKey: string, lineNumber?: number) {
	const { selectionStart } = textAreaRef.current;
	let block = 'center';
	if (!lineNumber)
		lineNumber = (textAreaRef.current.value ?? '')
			.substring(0, selectionStart)
			.split('\n').length;
	else block = 'start';
	let element;
	while (lineNumber && lineNumber > 0) {
		element = document.getElementById(`${componentKey}-div-${lineNumber}`);

		if (!element) lineNumber--;
		else break;
	}
	if (!element) return;
	setTimeout(() => element.scrollIntoView({ block, inline: 'nearest', behavior: 'smooth' }), 10);
}

function insertHeading(
	text: string,
	selectionStart: any,
	selectionEnd: any,
	prefix: string,
): string {
	const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
	const lineEnd = text.indexOf('\n', selectionEnd);
	const actualEnd = lineEnd === -1 ? text.length : lineEnd;
	const currentLine = text.substring(lineStart, actualEnd);

	const cleanLine = currentLine.replace(/^#+\s*/, '');

	const newLine = `${prefix} ${cleanLine}`;

	return text.substring(0, lineStart) + newLine + text.substring(actualEnd);
}

function insertList(text: string, selectionStart: any, selectionEnd: any, marker: string): string {
	const selectedText = text.substring(selectionStart, selectionEnd);
	const lines = selectedText.split('\n');

	const newLines = lines
		.map((line, index) => {
			const trimmedLine = line.trim();
			if (!trimmedLine) return '';

			const prefix = marker === '1.' ? `${index + 1}.` : marker;
			return `${prefix} ${trimmedLine}`;
		})
		.join('\n');

	return text.substring(0, selectionStart) + newLines + text.substring(selectionEnd);
}

function insertPrefix(
	text: string,
	selectionStart: any,
	selectionEnd: any,
	prefix: string,
): string {
	const selectedText = text.substring(selectionStart, selectionEnd);
	const lines = selectedText.split('\n');

	const newLines = lines
		.map(line => {
			const trimmedLine = line.trim();
			return trimmedLine ? `${prefix} ${trimmedLine}` : '';
		})
		.join('\n');

	return text.substring(0, selectionStart) + newLines + text.substring(selectionEnd);
}

function makeTextForImageSelection(text: string, s: number, e: number, file: string): string {
	if (s != e) {
		const selection = text.substring(s, e);
		if (selection.indexOf('![') != -1) file = `![](${file})`;
		return text.substring(0, s) + file + text.substring(e);
	}
	let newStart = text.lastIndexOf('(', s);
	let newLine = text.lastIndexOf('\n', s);
	let found = false;
	if (newStart == -1) newStart = s;
	else found = true;
	if (newLine > newStart) newStart = newLine;
	let newEnd = text.indexOf(')', e);
	let space = text.indexOf(' ', newStart);
	newLine = text.indexOf('\n', e);

	if (newEnd == -1) newEnd = e;
	if (newLine < newEnd && newLine != -1) newEnd = newLine;
	if (newEnd <= s) found = false;
	if (space < newEnd && space != -1) newEnd = space;

	if (found) {
		return text.substring(0, newStart + 1) + file + text.substring(newEnd);
	}

	file = `![](${file})`;
	return text.substring(0, s) + file + text.substring(e);
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
function setShowRichTextBar(arg0: boolean) {
	throw new Error('Function not implemented.');
}
