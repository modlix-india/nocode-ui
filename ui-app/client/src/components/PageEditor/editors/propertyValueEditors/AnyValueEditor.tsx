import React, { Suspense, useEffect } from 'react';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

interface AnyValueEditorProps {
	value?: any;
	defaultValue?: any;
	onChange?: (v: any) => void;
	isIconButton?: boolean;
	buttonLabel?: string;
}

function getTextualValue(value: any) {
	if (value === undefined) return '';
	if (value === null) return 'null';
	return JSON.stringify(value, null, 2);
}

export function AnyValueEditor({
	value,
	defaultValue,
	onChange,
	isIconButton = false,
	buttonLabel = 'Edit',
}: Readonly<AnyValueEditorProps>) {
	const [localValue, setLocalValue] = React.useState(getTextualValue(value ?? defaultValue));
	const [showEditor, setShowEditor] = React.useState(false);
	const [editorValue, setEditorValue] = React.useState(getTextualValue(value ?? defaultValue));
	const [enableOk, setEnableOk] = React.useState(false);

	useEffect(() => {
		setLocalValue(getTextualValue(value));
	}, [value]);

	let popup = <></>;
	if (showEditor) {
		popup = (
			<div className={`_popupBackground`} onClick={() => setShowEditor(false)}>
				<div className="_popupContainer" onClick={e => e.stopPropagation()}>
					<div className="_jsonEditorContainer">
						<Suspense fallback={<div className="_editorLoading">Loading editor...</div>}>
							<LazyEditor
								language="json"
								height="100%"
								value={localValue}
								onChange={ev => {
									setEditorValue(ev ?? '');
									try {
										if (ev !== 'undefined' && ev !== 'null' && ev) JSON.parse(ev);
										setEnableOk(true);
									} catch (err) {
										setEnableOk(false);
									}
								}}
							/>
						</Suspense>
					</div>
					<div className="_popupButtons">
						<button
							disabled={!enableOk}
							onClick={() => {
								let v = undefined;
								let ev = (editorValue ?? '').trim();
								if (ev === 'undefined' || ev === '') v = undefined;
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
		);
	}

	const trigger = isIconButton ? (
		<button
			className="_iconOnly fa fa-solid fa-arrow-up-right-from-square"
			onClick={() => {
				setShowEditor(true);
				setEditorValue(localValue);
			}}
		/>
	) : (
		<button
			onClick={() => {
				setShowEditor(true);
				setEditorValue(localValue);
			}}
		>
			{buttonLabel}
		</button>
	);

	return (
		<div className="_smallEditorContainer">
			{trigger}
			{popup}
		</div>
	);
}
