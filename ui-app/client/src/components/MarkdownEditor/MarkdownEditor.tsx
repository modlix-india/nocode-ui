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
import { FilterPanelButtons } from './components/FilterPanelButtons';
import { AddComponentPanelButtons } from './components/AddComponentPanelButtons';
import axios from 'axios';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import { scrollToCaret, makeTextForImageSelection } from './utils/textManipulation';
import { useMarkdownExport } from './hooks/useMarkdownExport';
import { useMarkdownHistory } from './hooks/useMarkdownHistory';
import { useMarkdownFormatting } from './hooks/useMarkdownFormatting';

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
			showActionButtons,
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
	const [textAreaWidth, setTextAreaWidth] = useState<number>(0);
	const [filterPanelPosition, setFilterPanelPosition] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [selectedText, setSelectedText] = useState('');
	const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
	const [isComponentPanelExpanded, setIsComponentPanelExpanded] = useState(false);
	const [componentSearchTerm, setComponentSearchTerm] = useState('');
	const [showExportOptions, setShowExportOptions] = useState(false);

	const textAreaRef = useRef<any>(null);
	const wrapperRef = useRef<any>(null);
	const resizerBarRef = useRef<any>(null);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const { handleExport } = useMarkdownExport();
	const { history, historyIndex, addToHistory, undo, redo } = useMarkdownHistory();
	const { formatText } = useMarkdownFormatting();

	const onExport = (type: 'md' | 'html' | 'pdf') => {
		handleExport(text, type);
	};

	const handleUndo = () => {
		undo(setText, textAreaRef);
	};

	const handleRedo = () => {
		redo(setText, textAreaRef);
	};

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

	const [activeTab, setActiveTab] = useState<'write' | 'doc' | 'preview'>(() => {
		switch (editType) {
			case 'editDoc':
				return 'doc';
			case 'editTextnDoc':
				return 'preview';
			default:
				return 'write';
		}
	});

	useEffect(() => {
		switch (editType) {
			case 'editDoc':
				setActiveTab('doc');
				setShowFullPreview(false);
				break;
			case 'editTextnDoc':
				setActiveTab('preview');
				setShowFullPreview(true);
				break;
			default:
				setActiveTab('write');
				setShowFullPreview(false);
		}
	}, [editType]);

	useEffect(() => {
		if (!textAreaRef.current || !wrapperRef.current) return;

		const handleResize = () => {
			if (!wrapperRef.current || !textAreaRef.current) return;
			const textAreaHeight = Math.max(
				textAreaRef.current.scrollHeight,
				window.innerHeight * 0.3, // 30vh minimum
			);
			wrapperRef.current.style.height = `${textAreaHeight}px`;
			textAreaRef.current.style.height = `${textAreaHeight}px`;
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [mode, textAreaRef.current, wrapperRef.current]);

	useEffect(() => {
		if (!textAreaRef?.current) return;

		const handleSelection = () => {
			const { selectionStart, selectionEnd } = textAreaRef.current;
			const selectedText = text.substring(selectionStart, selectionEnd);

			if (selectionStart !== selectionEnd && !filterPanelPosition) {
				const rect = textAreaRef.current.getBoundingClientRect();
				setFilterPanelPosition({
					x: rect.left + rect.width / 2 - 150,
					y: rect.top + 10,
				});
			}
			setIsFilterPanelVisible(selectionStart !== selectionEnd);
			setSelectedText(selectedText);
		};

		textAreaRef.current.addEventListener('select', handleSelection);
		textAreaRef.current.addEventListener('mouseup', handleSelection);
		textAreaRef.current.addEventListener('keyup', handleSelection);

		return () => {
			textAreaRef?.current?.removeEventListener('select', handleSelection);
			textAreaRef?.current?.removeEventListener('mouseup', handleSelection);
			textAreaRef?.current?.removeEventListener('keyup', handleSelection);
		};
	}, [textAreaRef?.current]);

	const handleRichTextCommand = (
		command: string,
		value?: string | { url: string; text: string },
	) => {
		if (activeTab === 'write' && textAreaRef.current) {
			const { selectionStart, selectionEnd } = textAreaRef.current;
			const { newText, newCursorPos } = formatText(
				text,
				command,
				{ start: selectionStart, end: selectionEnd },
				value,
			);

			onChangeText(newText, () => {
				textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
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

		addToHistory(editedText);

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
		renderingComponent = (
			<MarkdownParser componentKey={componentKey} text={text} styles={styleProperties} />
		);
	} else {
		const showText = mode.indexOf('Text') != -1;
		const showDoc = mode.indexOf('Doc') != -1;
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
											selectionStart + paste.length + 4,
											selectionStart + paste.length + 4,
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
			<MarkdownParser
				componentKey={componentKey}
				text={text}
				styles={styleProperties}
				editable={true}
				onChange={onChangeText}
				className={showBoth ? '_both' : ''}
			/>
		) : undefined;

		if (showBoth) {
			docComp = (
				<div
					className="_wrapper"
					ref={x => {
						wrapperRef.current = x;
						if (!x || !textAreaRef.current) return;
						x.style.height = textAreaRef.current.scrollHeight + 'px';
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

	if (textAreaRef.current) {
		textAreaRef.current.style.height = showBoth
			? '100%'
			: textAreaRef.current.scrollHeight + 'px';
	}

	useEffect(() => {
		const handleKeyboard = (e: KeyboardEvent) => {
			if (!textAreaRef.current || document.activeElement !== textAreaRef.current) return;
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const modifier = isMac ? e.metaKey : e.ctrlKey;

			if (modifier) {
				if (e.shiftKey && e.key.toLowerCase() === 'z') {
					e.preventDefault();
					handleRedo();
				} else {
					switch (e.key.toLowerCase()) {
						case 'z':
							e.preventDefault();
							handleUndo();
							break;
						case 'b':
							e.preventDefault();
							handleRichTextCommand('bold');
							break;
						case 'i':
							e.preventDefault();
							handleRichTextCommand('italic');
							break;
						case '/':
							e.preventDefault();
							setIsComponentPanelExpanded(prev => !prev);
							break;
						case '[':
							e.preventDefault();
							handleRichTextCommand('indent');
							break;
						case ']':
							e.preventDefault();
							handleRichTextCommand('unindent');
							break;
					}
				}
			}
		};

		document.addEventListener('keydown', handleKeyboard);
		return () => document.removeEventListener('keydown', handleKeyboard);
	}, [text, history, historyIndex]);

	// Modify mode handling to match GitHub style
	const [showFullPreview, setShowFullPreview] = useState(false);

	// New method to handle tab switching
	const handleTabChange = (tab: 'write' | 'doc' | 'preview') => {
		setActiveTab(tab);
		if (tab === 'preview') {
			setShowFullPreview(true);
		} else {
			setShowFullPreview(false);
		}
	};

	return (
		<div className="comp compMarkdownEditor" style={styleProperties.comp ?? {}}>
			<div className="_editorHeader">
				<div className="_tabContainer">
					<div className="_tabspace">
						<div className="_tabSeperator1"></div>
					</div>
					<button
						className={`_tab ${activeTab === 'write' ? '_active _write-tab' : ''}`}
						onClick={() => handleTabChange('write')}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 19 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
							<path
								d="M8.33301 2.3335L12.9997 7.00016L8.33301 2.3335Z"
								fill="white"
							/>
							<path
								d="M8.33301 2.3335L12.9997 7.00016"
								stroke="#016A70"
								strokeWidth="1.2"
								strokeLinejoin="round"
							/>
						</svg>
						Write
					</button>
					<div className="_tabspace">
						<div className="_tabSeperator" />
					</div>
					<button
						className={`_tab ${activeTab === 'doc' ? '_active _doc-tab' : ''}`}
						onClick={() => handleTabChange('doc')}
					>
						<svg
							width="17"
							height="17"
							viewBox="0 0 19 17"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
					</button>
					<div className="_tabspace">
						<div className="_tabSeperator" />
					</div>
					<button
						className={`_tab ${activeTab === 'preview' ? '_active _preview-tab' : ''}`}
						onClick={() => handleTabChange('preview')}
					>
						<svg
							width="18"
							height="16"
							viewBox="0 0 18 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
					</button>
				</div>

				{activeTab === 'write' && (
					<>
						<div className="_toolbarContainer">
							<AddComponentPanelButtons
								onComponentAdd={(componentType: string) => {
									if (activeTab === 'write' && textAreaRef.current) {
										const { selectionStart } = textAreaRef.current;
										const newText = `${text.substring(0, selectionStart)}${componentType}${text.substring(selectionStart)}`;
										onChangeText(newText);
									} else {
										const newText = `${text}${componentType}`;
										onChangeText(newText);
									}
								}}
								isExpanded={isComponentPanelExpanded}
								onExpandChange={setIsComponentPanelExpanded}
								searchTerm={componentSearchTerm}
								onSearchChange={setComponentSearchTerm}
								styleProperties={styleProperties}
							/>
						</div>
						<div className="_toolbarContainer">
							<FilterPanelButtons
								onFormatClick={handleRichTextCommand}
								isVisible={true}
								styleProperties={styleProperties}
								selectedText={selectedText}
							/>

							{showActionButtons === 'true' && (
								<div className="_actionButtons">
									<button
										className="_actionButton"
										onClick={() => navigator.clipboard.writeText(text)}
										title="Copy content"
									>
										<svg
											width="17"
											height="17"
											viewBox="0 0 17 17"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M14.5 5.5H7C6.17157 5.5 5.5 6.17157 5.5 7V14.5C5.5 15.3284 6.17157 16 7 16H14.5C15.3284 16 16 15.3284 16 14.5V7C16 6.17157 15.3284 5.5 14.5 5.5Z"
												stroke="black"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M2.5 11.5C1.675 11.5 1 10.825 1 10V2.5C1 1.675 1.675 1 2.5 1H10C10.825 1 11.5 1.675 11.5 2.5"
												stroke="black"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
									<div className="_exportDropdown">
										<button
											className="_actionButton"
											onClick={() => setShowExportOptions(!showExportOptions)}
											title="Export"
										>
											<svg
												width="13"
												height="16"
												viewBox="0 0 13 16"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M6.25 11.5V1"
													stroke="black"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												<path
													d="M1.75 7L6.25 11.5L10.75 7"
													stroke="black"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												<path
													d="M11.5 14.5H1"
													stroke="black"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
										</button>
										{showExportOptions && (
											<div className="_exportOptions">
												<button
													onClick={() => {
														onExport('md');
														setShowExportOptions(false);
													}}
												>
													Download as MD
												</button>
												<button
													onClick={() => {
														onExport('html');
														setShowExportOptions(false);
													}}
												>
													Download as HTML
												</button>
												<button
													onClick={() => {
														onExport('pdf');
														setShowExportOptions(false);
													}}
												>
													Download as PDF
												</button>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</>
				)}
			</div>

			<div className="_editorContainer">
				{activeTab === 'write' ? (
					<textarea
						ref={textAreaRef}
						value={text}
						onChange={ev => onChangeText(ev.target.value)}
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
								const newText = `${text.substring(0, selectionStart)}    ${text.substring(selectionEnd)}`;
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
									Authorization: getDataFromPath(
										`${LOCAL_STORE_PREFIX}.AuthToken`,
										[],
									),
								};
								if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

								(async () => {
									try {
										let url = `/api/files/static/${pathForPastedFiles}`;
										let data = await axios.post(url, formData, { headers });
										if (data.status === 200) {
											const { selectionStart } = textAreaRef.current;
											const paste = data.data.url;
											const newText = `${text.substring(0, selectionStart)}![](${paste})${text.substring(selectionStart)}`;
											onChangeText(newText, () =>
												textAreaRef.current.setSelectionRange(
													selectionStart + paste.length + 4,
													selectionStart + paste.length + 4,
												),
											);
										}
									} catch (e) {}
								})();
							} else {
								const paste = ev.clipboardData.getData('text');
								const { selectionStart, selectionEnd } = textAreaRef.current;
								const newText = `${text.substring(0, selectionStart)}${paste}${text.substring(selectionEnd)}`;
								onChangeText(newText, () =>
									textAreaRef.current.setSelectionRange(
										selectionStart + paste.length,
										selectionStart + paste.length,
									),
								);
							}
						}}
						style={styleProperties.textArea ?? {}}
						placeholder="Write your Content here..."
						spellCheck="false"
						autoComplete="off"
					/>
				) : activeTab === 'doc' ? (
					<div className="_documentModeContainer">
						<MarkdownParser
							componentKey={componentKey}
							text={text}
							styles={styleProperties}
							editable={true}
							onChange={editedText => {
								onChangeText(editedText);
							}}
							className="_editableMarkdown"
						/>
						{/* <div className="_addComponentButton">
							<button
								onClick={() => {
									onChangeText(text + '\n\n');
								}}
							>
								<i className="fa fa-plus"></i>
							</button>
						</div> */}
					</div>
				) : (
					<MarkdownParser
						componentKey={componentKey}
						text={text}
						styles={styleProperties}
					/>
				)}
			</div>
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
