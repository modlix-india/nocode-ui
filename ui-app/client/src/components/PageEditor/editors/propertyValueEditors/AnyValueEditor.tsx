import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';

import Portal from '../../../Portal';

interface AnyValueEditorProps {
	value?: any;
	defaultValue?: any;
	onChange?: (v: any) => void;
}

function getTextualValue(value: any) {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	return JSON.stringify(value, null, 2);
}

export function AnyValueEditor({ value, defaultValue, onChange }: AnyValueEditorProps) {
	const [localValue, setLocalValue] = React.useState(getTextualValue(value));
	const [showEditor, setShowEditor] = React.useState(false);
	const [editorValue, setEditorValue] = React.useState(getTextualValue(value));
	const [enableOk, setEnableOk] = React.useState(false);

	useEffect(() => {
		setLocalValue(getTextualValue(value));
	}, [value]);

	let popup = <></>;
	if (showEditor) {
		popup = (
			<Portal>
				<div className={`_popupBackground`} onClick={() => setShowEditor(false)}>
					<div className="_popupContainer" onClick={e => e.stopPropagation()}>
						<div className="_jsonEditorContainer">
							<Editor
								language="json"
								height="100%"
								value={localValue}
								onChange={ev => {
									setEditorValue(ev ?? '');
									try {
										if (ev !== 'undefined' && ev !== 'null' && ev)
											JSON.parse(ev);
										setEnableOk(true);
									} catch (err) {
										setEnableOk(false);
									}
								}}
							/>
						</div>
						<div className="_popupButtons">
							<button
								disabled={!enableOk}
								onClick={() => {
									let v = undefined;
									let ev = (editorValue ?? '').trim();
									if (ev === 'undefined') v = undefined;
									else if (ev === 'null') v = null;
									else if (ev) v = JSON.parse(ev);
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
				</div>
			</Portal>
		);
	}

	return (
		<div className="_smallEditorContainer">
			<button
				onClick={() => {
					setShowEditor(true);
					setEditorValue(localValue);
				}}
			>
				Edit
			</button>
			{popup}
		</div>
	);
}
