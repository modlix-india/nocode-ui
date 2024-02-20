import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import Portal from '../../../Portal';
import { ComponentPropertyDefinition } from '../../../../types/common';
import MarkDownToComponent from '../../../../commonComponents/MarkDownToComponents';

interface AnyValueEditorProps {
	value?: any;
	defaultValue?: any;
	onChange?: (v: any) => void;
	isIconButton?: boolean;
	buttonLabel?: string;
	propDef: ComponentPropertyDefinition;
}

export function TextValueEditor({ value, defaultValue, onChange }: AnyValueEditorProps) {
	const [localValue, setLocalValue] = React.useState(value ?? defaultValue);
	const [showEditor, setShowEditor] = React.useState(false);
	const [editorValue, setEditorValue] = React.useState(value ?? defaultValue);
	const [enableOk, setEnableOk] = React.useState(false);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	let popup = <></>;
	if (showEditor) {
		popup = (
			<Portal>
				<div className={`_popupBackground`} onClick={() => setShowEditor(false)}>
					<div
						className="_popupContainer _popupContainerWithPreview"
						onClick={e => e.stopPropagation()}
					>
						<div>
							<div className="_jsonEditorContainer">
								<Editor
									language="markdown"
									height="100%"
									value={localValue}
									onChange={ev => {
										setEditorValue(ev ?? '');
										if (ev !== 'undefined' && ev !== 'null' && ev)
											setEnableOk(true);
									}}
								/>
							</div>
							<div className="_popupButtons">
								<button
									disabled={!enableOk}
									onClick={() => {
										let v = undefined;
										let ev = (editorValue ?? '').trim();
										if (ev === 'undefined' || ev === '') v = undefined;
										else if (ev === 'null') v = null;
										else if (ev) v = ev;
										onChange?.(v);
										setShowEditor(false);
									}}
								>
									Ok
								</button>

								<button
									onClick={() => {
										setShowEditor(false);
									}}
								>
									Cancel
								</button>
							</div>
						</div>
						<div className="_mdPreviewContainer">
							<MarkDownToComponent text={editorValue} />
						</div>
					</div>
				</div>
			</Portal>
		);
	}

	const trigger = (
		<i
			className="fa fa-solid fa-arrow-up-right-from-square"
			tabIndex={0}
			role="button"
			onClick={() => {
				setShowEditor(true);
				setEditorValue(localValue);
			}}
		/>
	);

	return (
		<div className="_textValueEditorContainer">
			<input
				className="_peInput"
				type="text"
				value={value ?? ''}
				placeholder={defaultValue ?? undefined}
				onChange={e => {
					onChange?.(e.target.value);
				}}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						onChange?.(value ?? '');
					} else if (e.key === 'Escape') {
						onChange?.(value ?? '');
					}
				}}
				onBlur={() => onChange?.(value ?? '')}
			/>
			{trigger}
			{popup}
		</div>
	);
}
