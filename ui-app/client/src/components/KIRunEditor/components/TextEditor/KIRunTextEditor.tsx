import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import {
	DSLCompiler,
	Repository,
	Function,
	Schema,
	FunctionDefinition,
	KIRuntime,
	StatementMessageType,
} from '@fincity/kirun-js';
import { registerKIRunLanguage } from './syntax/kirunLanguage';
import { registerKIRunThemes } from './syntax/kirunTheme';
import {
	registerKIRunCompletionProvider,
	setCompletionFunctionRepository,
} from './syntax/kirunCompletion';

export type EditorTheme = 'light' | 'dark' | 'high-contrast' | 'easy-on-eyes' | 'flared-up';

function getMonacoThemeName(theme: EditorTheme): string {
	const themeMap: Record<EditorTheme, string> = {
		'light': 'kirun-light',
		'dark': 'kirun-dark',
		'high-contrast': 'kirun-high-contrast',
		'easy-on-eyes': 'kirun-easy-on-eyes',
		'flared-up': 'kirun-flared-up',
	};
	return themeMap[theme] || 'kirun-light';
}

interface KIRunTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	onValidate?: (errors: monaco.editor.IMarker[]) => void;
	theme?: EditorTheme;
	readOnly?: boolean;
	wordWrap?: 'on' | 'off';
	functionRepository?: Repository<Function>;
	schemaRepository?: Repository<Schema>;
	onEditorReady?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

let languageRegistered = false;

/**
 * KIRun Text Editor
 * Monaco editor configured for KIRun DSL
 */
export function KIRunTextEditor({
	value,
	onChange,
	onValidate,
	theme = 'dark',
	readOnly = false,
	wordWrap = 'on',
	functionRepository,
	schemaRepository,
	onEditorReady,
}: KIRunTextEditorProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof monaco | null>(null);
	const reposRef = useRef({ functionRepository, schemaRepository });

	// Keep refs updated
	useEffect(() => {
		reposRef.current = { functionRepository, schemaRepository };
	}, [functionRepository, schemaRepository]);

	// Update the completion repository when it changes
	useEffect(() => {
		setCompletionFunctionRepository(functionRepository);
	}, [functionRepository]);

	useEffect(() => {
		if (!containerRef.current) return;

		// Register language and themes once
		if (!languageRegistered) {
			registerKIRunLanguage();
			registerKIRunThemes();
			registerKIRunCompletionProvider();
			languageRegistered = true;
		}

		// Create editor
		const editor = monaco.editor.create(containerRef.current, {
			value,
			language: 'kirun-dsl',
			theme: getMonacoThemeName(theme),
			readOnly,
			minimap: { enabled: true },
			lineNumbers: 'on',
			folding: true,
			automaticLayout: true,
			scrollBeyondLastLine: false,
			wordWrap,
			fontSize: 14,
			tabSize: 4,
			insertSpaces: true,
		});

		editorRef.current = editor;
		monacoRef.current = monaco;

		// Notify parent that editor is ready
		if (onEditorReady) {
			onEditorReady(editor);
		}

		// Handle value changes
		const onChangeDisposable = editor.onDidChangeModelContent(() => {
			const newValue = editor.getValue();
			onChange(newValue);
		});

		// Build a map of statement names to line numbers
		const buildStatementLineMap = (text: string): Map<string, number> => {
			const lineMap = new Map<string, number>();
			const lines = text.split('\n');
			// Match statement definitions: "statementName:" at the start of a line (with optional whitespace)
			const stmtPattern = /^\s*([a-zA-Z_]\w*)\s*:/;
			for (let i = 0; i < lines.length; i++) {
				const match = lines[i].match(stmtPattern);
				if (match) {
					lineMap.set(match[1], i + 1); // Monaco uses 1-based line numbers
				}
			}
			return lineMap;
		};

		// Debounced validation using KIRuntime
		let validationTimeout: NodeJS.Timeout;
		const validateContent = async () => {
			const model = editor.getModel();
			if (!model) return;

			const text = model.getValue();
			const markers: monaco.editor.IMarkerData[] = [];

			try {
				// First, validate DSL syntax
				const syntaxResult = DSLCompiler.validate(text);
				if (!syntaxResult.valid) {
					// Syntax errors - show them
					for (const err of syntaxResult.errors) {
						markers.push({
							severity: monaco.MarkerSeverity.Error,
							startLineNumber: err.line || 1,
							startColumn: err.column || 1,
							endLineNumber: err.line || 1,
							endColumn: (err.column || 1) + 10,
							message: err.message,
						});
					}
					monaco.editor.setModelMarkers(model, 'kirun-dsl', markers);
					onValidate?.(markers as any);
					return;
				}

				// Syntax is valid, now compile to JSON and validate with KIRuntime
				const { functionRepository: fRepo, schemaRepository: sRepo } = reposRef.current;
				if (!fRepo || !sRepo) {
					// No repositories available, skip runtime validation
					monaco.editor.setModelMarkers(model, 'kirun-dsl', []);
					onValidate?.([]);
					return;
				}

				const json = DSLCompiler.compile(text);
				const funcDef = FunctionDefinition.from(json);
				const runtime = new KIRuntime(funcDef);

				// Get execution plan - this validates the function
				const executionPlan = await runtime.getExecutionPlan(fRepo, sRepo);

				// Build statement to line number mapping
				const statementLineMap = buildStatementLineMap(text);

				// Extract errors from the execution plan
				const nodeMap = executionPlan.getNodeMap();
				for (const [statementName, vertex] of nodeMap) {
					const stmtExecution = vertex.getData();
					const messages = stmtExecution.getMessages();

					for (const msg of messages) {
						const msgType = msg.getMessageType();
						const msgText = msg.getMessage();

						if (msgType === StatementMessageType.ERROR) {
							const lineNumber = statementLineMap.get(statementName) || 1;
							markers.push({
								severity: monaco.MarkerSeverity.Error,
								startLineNumber: lineNumber,
								startColumn: 1,
								endLineNumber: lineNumber,
								endColumn: 1000, // Highlight the whole line
								message: `${statementName}: ${msgText}`,
							});
						} else if (msgType === StatementMessageType.WARNING) {
							const lineNumber = statementLineMap.get(statementName) || 1;
							markers.push({
								severity: monaco.MarkerSeverity.Warning,
								startLineNumber: lineNumber,
								startColumn: 1,
								endLineNumber: lineNumber,
								endColumn: 1000,
								message: `${statementName}: ${msgText}`,
							});
						}
					}
				}

				monaco.editor.setModelMarkers(model, 'kirun-dsl', markers);
				onValidate?.(markers as any);
			} catch (error: any) {
				// Compilation or runtime error
				markers.push({
					severity: monaco.MarkerSeverity.Error,
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 10,
					message: error.message || 'Unknown error',
				});
				monaco.editor.setModelMarkers(model, 'kirun-dsl', markers);
				onValidate?.(markers as any);
			}
		};

		// Validate on change (debounced)
		const onContentChangeDisposable = editor.onDidChangeModelContent(() => {
			clearTimeout(validationTimeout);
			validationTimeout = setTimeout(validateContent, 500);
		});

		// Initial validation
		validateContent();

		// Cleanup
		return () => {
			onChangeDisposable.dispose();
			onContentChangeDisposable.dispose();
			clearTimeout(validationTimeout);
			editor.dispose();
		};
	}, []);

	// Update value when prop changes
	useEffect(() => {
		if (editorRef.current && editorRef.current.getValue() !== value) {
			editorRef.current.setValue(value);
		}
	}, [value]);

	// Update theme when prop changes
	useEffect(() => {
		if (monacoRef.current) {
			monacoRef.current.editor.setTheme(getMonacoThemeName(theme));
		}
	}, [theme]);

	// Update readOnly when prop changes
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ readOnly });
		}
	}, [readOnly]);

	// Update wordWrap when prop changes
	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ wordWrap });
		}
	}, [wordWrap]);

	return (
		<div
			ref={containerRef}
			style={{
				width: '100%',
				height: '100%',
				minHeight: '400px',
			}}
		/>
	);
}
