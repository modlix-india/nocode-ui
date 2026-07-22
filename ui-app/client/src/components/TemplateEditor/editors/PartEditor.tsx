import React, { Suspense, useRef, useState } from 'react';
import { TemplatePartDef } from '../util/templateTypes';
import { VariableEntry } from '../util/variableUtils';

const LazyEditor = React.lazy(() =>
	import('@monaco-editor/react').then(module => ({ default: module.default })),
);

interface PartEditorProps {
	part: TemplatePartDef;
	value: string;
	onChange: (v: string) => void;
	variables: VariableEntry[];
}

// Editor for a single template part. HTML parts use Monaco; text parts use a textarea.
// Both support inserting FreeMarker variable tokens at the caret via the merge-field picker.
export default function PartEditor({ part, value, onChange, variables }: Readonly<PartEditorProps>) {
	const monacoRef = useRef<any>(null);
	const textRef = useRef<HTMLTextAreaElement | null>(null);
	const [showVars, setShowVars] = useState(false);

	const insertToken = (token: string) => {
		if (part.editor === 'html' && monacoRef.current) {
			const editor = monacoRef.current;
			const selection = editor.getSelection();
			editor.executeEdits('insert-variable', [
				{ range: selection, text: token, forceMoveMarkers: true },
			]);
			editor.focus();
		} else if (textRef.current) {
			const el = textRef.current;
			const start = el.selectionStart ?? (value ?? '').length;
			const end = el.selectionEnd ?? (value ?? '').length;
			const next = (value ?? '').substring(0, start) + token + (value ?? '').substring(end);
			onChange(next);
			requestAnimationFrame(() => {
				el.focus();
				const pos = start + token.length;
				el.setSelectionRange(pos, pos);
			});
		} else {
			onChange((value ?? '') + token);
		}
		setShowVars(false);
	};

	const format = () =>
		monacoRef.current?.getAction?.('editor.action.formatDocument')?.run?.();

	return (
		<div className="_partEditor">
			<div className="_partToolbar">
				<span className="_partLabel">{part.label}</span>
				<div className="_partToolbarActions">
					{part.editor === 'html' && (
						<button type="button" className="_ghostBtn" onClick={format} title="Format HTML">
							<i className="fa fa-solid fa-wand-magic-sparkles" /> Format
						</button>
					)}
					<div className="_varPicker">
					<button
						type="button"
						className="_varButton"
						onClick={() => setShowVars(s => !s)}
					>
						Insert variable ▾
					</button>
					{showVars && (
						<div className="_varDropdown">
							{variables.length === 0 && (
								<div className="_varEmpty">
									No variables yet. Define them in the Variables panel, or type
									{' ${name}'} directly.
								</div>
							)}
							{variables.map(v => (
								<button
									key={v.path}
									type="button"
									className="_varItem"
									onClick={() => insertToken(v.token)}
								>
									<span className="_varPath">{v.token}</span>
									{v.type && <span className="_varType">{v.type}</span>}
								</button>
							))}
						</div>
					)}
				</div>
				</div>
			</div>
			{part.editor === 'html' ? (
				<div className="_htmlEditor">
					<Suspense
						fallback={<div className="_editorLoading">Loading editor...</div>}
					>
						<LazyEditor
							language="html"
							height="100%"
							value={value ?? ''}
							onChange={(ev: string | undefined) => onChange(ev ?? '')}
							onMount={(editor: any) => {
								monacoRef.current = editor;
							}}
							options={{
								minimap: { enabled: false },
								wordWrap: 'on',
								fontSize: 13,
								automaticLayout: true,
								scrollBeyondLastLine: false,
							}}
						/>
					</Suspense>
				</div>
			) : (
				<textarea
					ref={textRef}
					className="_textPart"
					value={value ?? ''}
					placeholder={part.placeholder}
					onChange={e => onChange(e.target.value)}
				/>
			)}
		</div>
	);
}
