import React, { useEffect, useRef, useState } from 'react';
import { styleProperties } from '../markdownEditorStyleProperties';
import { FileBrowser } from '../../../commonComponents/FileBrowser';
import { isNullValue } from '@fincity/kirun-js';

export type EditorMode = 'editText' | 'editDoc' | 'editTextnDoc';

interface MEButtonBarProps {
	mode: EditorMode;
	onModeChange: (mode: EditorMode) => void;
	onFileSelected: (start: number, end: number, file: string) => void;
	styleProperties: any;
	textAreaRef: any;
}

export function MEButtonBar({
	mode,
	onModeChange,
	styleProperties,
	onFileSelected,
	textAreaRef,
}: Readonly<MEButtonBarProps>) {
	const [buttonBarPosition, setButtonBarPosition] = useState({ x: 0, y: 0 });
	const buttonBarRef = useRef<any>(null);
	const [showFileBrowser, setShowFileBrowser] = useState<
		{ selectionStart: number; selectionEnd: number } | undefined
	>();

	const [buttonBarTop, setButtonBarTop] = useState();

	useEffect(() => {
		if (isNullValue(textAreaRef)) return;
		setButtonBarTop(x => {
			if (x) return x;
			let tp = textAreaRef?.getBoundingClientRect().top;

			if (tp + 100 > window.innerHeight) tp -= 100;

			return tp;
		});
	}, [setButtonBarTop, textAreaRef?.getBoundingClientRect().top]);

	let fileBrowser = undefined;

	if (showFileBrowser) {
		let filePath = '';

		if (textAreaRef.current) {
			const selectionStart = showFileBrowser.selectionStart;
			const selectionEnd = showFileBrowser.selectionEnd;
			const text = textAreaRef.current.value;
			const start = text.lastIndexOf('(', selectionStart);
			const end = text.indexOf(')', selectionEnd);
			if (start !== -1 && end !== -1) {
				filePath = text.substring(start + 1, end);
			}
		}

		fileBrowser = (
			<div
				className="_popupBackground"
				onClick={e => {
					if (e.target === e.currentTarget) setShowFileBrowser(undefined);
				}}
			>
				<div className="_popupContainer">
					<FileBrowser
						selectedFile={filePath}
						onChange={file => {
							onFileSelected(
								showFileBrowser.selectionStart,
								showFileBrowser.selectionEnd,
								file,
							);
							setShowFileBrowser(undefined);
						}}
						editOnUpload={false}
					/>
				</div>
			</div>
		);
	}

	return (
		<>
			<div
				className="_buttonBar"
				ref={buttonBarRef}
				style={
					styleProperties.buttonBar
						? {
								...styleProperties.buttonBar,
								transform: `translate(${buttonBarPosition.x}px, ${buttonBarPosition.y}px)`,
								top: `${buttonBarTop}px`,
							}
						: {
								transform: `translate(${buttonBarPosition.x}px, ${buttonBarPosition.y}px)`,
								top: `${buttonBarTop}px`,
							}
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
					onClick={() => onModeChange('editText')}
					style={styleProperties.button ?? {}}
					className={`_button ${mode === 'editText' ? 'active' : ''}`}
					title="Edit Text"
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
					onClick={() => onModeChange('editTextnDoc')}
					style={styleProperties.button ?? {}}
					className={`_button ${mode === 'editTextnDoc' ? 'active' : ''}`}
					title="Edit Text and Document"
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
				<div className="_buttonSeperator" />
				<button
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						setShowFileBrowser({
							selectionStart: textAreaRef?.selectionStart,
							selectionEnd: textAreaRef?.selectionEnd,
						});
					}}
					style={styleProperties.button ?? {}}
					className="_button"
				>
					<svg viewBox="0 0 32 32.017">
						<g transform="translate(-0.4 -3.777)">
							<path
								d="M15.789,8.589,5.924.559A1.363,1.363,0,0,0,5.349.288,1.45,1.45,0,0,0,4.184.531L1.168,2.809A1.6,1.6,0,0,0,.5,4.075V7.386A1.486,1.486,0,0,0,.916,8.4a2.034,2.034,0,0,0,1.483.61H15.3A.462.462,0,0,0,15.789,8.589Z"
								transform="translate(0.922 25.9)"
								fill="currentColor"
							/>
							<path
								d="M11.123,6.168,5.924.559A1.363,1.363,0,0,0,5.349.288,1.45,1.45,0,0,0,4.184.531V4.075c-.424.321,0-.484,0,0L.571,6.237A1.486,1.486,0,0,0,.987,7.252a2.034,2.034,0,0,0,1.483.61L10.63,6.591A.462.462,0,0,0,11.123,6.168Z"
								transform="translate(20.676 26.782)"
								fill="currentColor"
							/>
							<path
								d="M29.317,23.413l.092-16.679V5.278a1.5,1.5,0,1,1,2.991,0V30.669a5.123,5.123,0,0,1-5.122,5.125H5.522A5.123,5.123,0,0,1,.4,30.669V8.9A5.123,5.123,0,0,1,5.522,3.777l24.944,0a1.5,1.5,0,0,1,0,2.993l-24.944,0A2.131,2.131,0,0,0,3.391,8.9V19.826l.542-.542L6.614,16.6a4.848,4.848,0,0,1,6.682,0l4.494,4.5.224.225.224-.225,1.268-1.269h0a4.739,4.739,0,0,1,6.677,0h0Zm-25.832.556-.093.093v6.607A2.131,2.131,0,0,0,5.522,32.8h19.73l-.542-.542-7.8-7.8-5.747-5.75h0l-.005-.005a1.749,1.749,0,0,0-2.414,0h0l-.005.005Zm25.924,6.7v-3.38l-.092-.093-5.238-5.277h0a1.713,1.713,0,0,0-2.446,0h0l-1.267,1.267-.224.224.223.224,8.177,8.217.478-.033A1.932,1.932,0,0,0,29.409,30.672Z"
								transform="translate(0)"
								fill="currentColor"
							/>
						</g>
					</svg>
				</button>
			</div>
			{fileBrowser}
		</>
	);
}
