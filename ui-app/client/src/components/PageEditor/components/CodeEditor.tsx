import {
	Function,
	HybridRepository,
	Repository,
	Schema,
	TokenValueExtractor,
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';
import { StoreExtractor } from '@fincity/path-reactive-state-management';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	COPY_FUNCTION_KEY,
	COPY_STMT_KEY,
	LOCAL_STORE_PREFIX,
	STORE_PREFIX,
} from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import { ThemeExtractor } from '../../../context/ThemeExtractor';
import { REPO_SERVER, RemoteRepository } from '../../../Engine/RemoteRepository';
import { UIFunctionRepository } from '../../../functions';
import { UISchemaRepository } from '../../../schemas/common';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import KIRunEditor from '../../KIRunEditor/KIRunEditor';
import PageDefintionFunctionsRepository from '../../util/PageDefinitionFunctionsRepository';
import { explainFunction, modifyFunction } from '../util/aiService';

interface CodeEditorProps {
	showCodeEditor: string | undefined;
	onSetShowCodeEditor: (key: string | undefined) => void;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
	pageDefinition: PageDefinition;
	pageExtractor: PageStoreExtractor;
	slaveStore: any;
	firstTimeRef: React.MutableRefObject<PageDefinition[]>;
	undoStackRef: React.MutableRefObject<PageDefinition[]>;
	redoStackRef: React.MutableRefObject<PageDefinition[]>;
	latestVersion: React.MutableRefObject<number>;
	definition: ComponentDefinition;
	personalizationPath: string | undefined;
	storePaths: Set<string>;
	selectedSubComponent: string;
	selectedComponent?: string;
	onSelectedSubComponentChanged: (key: string) => void;
	onSelectedComponentChanged: (key: string) => void;
}

let UI_FUN_REPO: UIFunctionRepository;
let UI_SCHEMA_REPO: UISchemaRepository;

export default function CodeEditor({
	showCodeEditor,
	onSetShowCodeEditor,
	defPath,
	personalizationPath,
	locationHistory,
	context,
	pageDefinition,
	pageExtractor,
	slaveStore,
	firstTimeRef,
	undoStackRef,
	redoStackRef,
	latestVersion,
	definition,
	storePaths,
	selectedComponent,
	selectedSubComponent,
	onSelectedComponentChanged,
	onSelectedSubComponentChanged,
}: CodeEditorProps) {
	const uuid = useMemo(() => shortUUID(), []);
	const [fullScreen, setFullScreen] = useState(false);
	const [selectedFunction, setSelectedFunction] = useState(showCodeEditor);
	const [editPage, setEditPage] = useState<PageDefinition>();
	const [primedToClose, setPrimedToClose] = useState(false);
	const [changed, setChanged] = useState(Date.now());
	
	// AI functionality state
	const [aiLoading, setAiLoading] = useState(false);
	const [showAiDialog, setShowAiDialog] = useState<'explain' | 'modify' | null>(null);
	const [aiExplanation, setAiExplanation] = useState<{
		summary: string;
		explanation: string;
		steps: Array<{ name: string; description: string }>;
	} | null>(null);
	const [aiModifyPrompt, setAiModifyPrompt] = useState('');
	const [aiError, setAiError] = useState<string | null>(null);

	if (!UI_FUN_REPO) UI_FUN_REPO = new UIFunctionRepository();
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	const [remoteFunctionRepository, setRemoteFunctionRepository] = useState<Repository<Function>>(
		new HybridRepository(UI_FUN_REPO, new PageDefintionFunctionsRepository(editPage)),
	);
	const [remoteSchemaRepository, setRemoteSchemaRepository] =
		useState<Repository<Schema>>(UI_SCHEMA_REPO);

	const eventFunctions = editPage?.eventFunctions ?? {};

	useEffect(() => {
		if (showCodeEditor === selectedFunction && selectedFunction !== '') return;

		if ((!selectedFunction || showCodeEditor === '') && !isNullValue(eventFunctions)) {
			setSelectedFunction(Object.keys(eventFunctions)[0] ?? '');
		} else {
			setSelectedFunction(showCodeEditor);
		}
	}, [showCodeEditor, eventFunctions, setSelectedFunction, selectedFunction]);

	useEffect(() => {
		if (!defPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => {
				setEditPage(v);
				setChanged(Date.now());
				if (!v || !v.appCode || !v.clientCode) return;
				setRemoteFunctionRepository(
					new HybridRepository<Function>(
						UI_FUN_REPO,
						new PageDefintionFunctionsRepository(v),
						RemoteRepository.getRemoteFunctionRepository(
							v.appCode,
							v.clientCode,
							false,
							REPO_SERVER.CORE,
						),
						RemoteRepository.getRemoteFunctionRepository(
							v.appCode,
							v.clientCode,
							false,
							REPO_SERVER.UI,
						),
					),
				);
				setRemoteSchemaRepository(
					new HybridRepository<Schema>(
						UI_SCHEMA_REPO,
						RemoteRepository.getRemoteSchemaRepository(
							v.appCode,
							v.clientCode,
							false,
							REPO_SERVER.CORE,
						),
						RemoteRepository.getRemoteSchemaRepository(
							v.appCode,
							v.clientCode,
							false,
							REPO_SERVER.UI,
						),
					),
				);
			},
			defPath,
		);
	}, [defPath, setEditPage, pageExtractor]);

	const tokenValueExtractors = useMemo(() => {
		if (!slaveStore) return new Map<string, TokenValueExtractor>();

		const localStoreExtractor = new StoreExtractor(
			slaveStore.localStore,
			`${LOCAL_STORE_PREFIX}.`,
		);
		const storeExtractor = new StoreExtractor(slaveStore.store, `${STORE_PREFIX}.`);
		const pageStoreExtractor = new PageStoreExtractor(slaveStore.store);
		const themeExtractor = new ThemeExtractor();
		themeExtractor.setStore(slaveStore.store);
		return new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
			[pageStoreExtractor.getPrefix(), pageStoreExtractor],
			[themeExtractor.getPrefix(), themeExtractor],
		]);
	}, [slaveStore]);

	const changeEventFunction = useCallback(
		(key: string, functionObj: any) => {
			if (!defPath) return;

			const npageDefinition = duplicate(
				getDataFromPath(defPath, locationHistory, pageExtractor),
			) as PageDefinition;
			if (isNullValue(npageDefinition.eventFunctions)) npageDefinition.eventFunctions = {};
			const newEvFunc = npageDefinition.eventFunctions;
			if (isNullValue(functionObj)) delete newEvFunc[key];
			else newEvFunc[key] = functionObj;
			setData(defPath, npageDefinition, pageExtractor.getPageName());
			if (isNullValue(functionObj)) onSetShowCodeEditor('');
			else if (selectedFunction !== key) onSetShowCodeEditor(key);
		},
		[defPath, locationHistory, pageExtractor],
	);

	// AI Explain function handler
	const handleExplainFunction = useCallback(async () => {
		if (!selectedFunction || !eventFunctions[selectedFunction]) return;
		
		setAiLoading(true);
		setAiError(null);
		setShowAiDialog('explain');
		setAiExplanation(null);
		
		try {
			const result = await explainFunction(
				{
					functionDefinition: eventFunctions[selectedFunction],
					functionName: selectedFunction,
				},
				editPage?.appCode ?? 'appbuilder',
			);
			
			if (result.success) {
				setAiExplanation({
					summary: result.summary,
					explanation: result.explanation,
					steps: result.steps,
				});
			} else {
				setAiError('Failed to explain function');
			}
		} catch (error: any) {
			setAiError(error.message || 'Failed to explain function');
		} finally {
			setAiLoading(false);
		}
	}, [selectedFunction, eventFunctions, editPage?.appCode]);

	// AI Modify function handler
	const handleModifyFunction = useCallback(async () => {
		if (!selectedFunction || !eventFunctions[selectedFunction] || !aiModifyPrompt.trim()) return;
		
		setAiLoading(true);
		setAiError(null);
		
		try {
			const result = await modifyFunction(
				{
					instruction: aiModifyPrompt,
					functionDefinition: eventFunctions[selectedFunction],
					functionName: selectedFunction,
					pageContext: {
						componentDefinition: editPage?.componentDefinition,
						storePaths: Array.from(storePaths),
					},
				},
				editPage?.appCode ?? 'appbuilder',
			);
			
			if (result.success && result.functionDefinition) {
				// Apply the modified function
				changeEventFunction(selectedFunction, result.functionDefinition);
				setShowAiDialog(null);
				setAiModifyPrompt('');
			} else {
				setAiError('Failed to modify function');
			}
		} catch (error: any) {
			setAiError(error.message || 'Failed to modify function');
		} finally {
			setAiLoading(false);
		}
	}, [selectedFunction, eventFunctions, aiModifyPrompt, editPage, storePaths, changeEventFunction]);

	// Close AI dialog
	const closeAiDialog = useCallback(() => {
		setShowAiDialog(null);
		setAiExplanation(null);
		setAiModifyPrompt('');
		setAiError(null);
	}, []);

	if (isNullValue(showCodeEditor))
		return (
			<div className="_codeEditor">
				<div className="_codeEditorContent"></div>
			</div>
		);

	return (
		<div
			className="_codeEditor show"
			onMouseDown={e => (e.target === e.currentTarget ? setPrimedToClose(true) : null)}
			onMouseUp={e => {
				if (e.target !== e.currentTarget || !primedToClose) return;
				onSetShowCodeEditor(undefined);
				setPrimedToClose(false);
			}}
		>
			<div
				className={`_codeEditorContent ${fullScreen ? '_fullScreen' : ''}`}
				onClick={e => e.stopPropagation()}
			>
				<div className="_codeEditorHeader">
					<div className="_codeFunctions">
						<div className="_iconMenu" title="Code Editor">
							<i className="fa-solid fa-code" />
						</div>
						<select
							className="_peSelect"
							value={selectedFunction}
							onChange={e => onSetShowCodeEditor(e.target.value)}
							title="Select a function to edit"
						>
							{(eventFunctions ? Object.entries(eventFunctions) : []).map(
								([key, funct]: [string, any]) => {
									return (
										<option key={`${key}-${funct?.name ?? ''}`} value={key}>
											{funct.namespace
												? `${funct.namespace}.${funct.name}`
												: funct.name}
										</option>
									);
								},
							)}
						</select>
						<div
							className="_iconMenu"
							title="Create a new function"
							onClick={() => {
								let i = 0;
								let name = 'New_Function';
								while (
									Object.values(eventFunctions).findIndex(
										(v: any) => v.name === name,
									) !== -1
								) {
									i++;
									name = `New_Function_${i}`;
								}

								changeEventFunction(shortUUID(), { name, steps: {} });
							}}
						>
							<i className="fa fa-regular fa-square-plus" />
						</div>
						{!selectedFunction ? (
							<></>
						) : (
							<div
								title="Delete this function"
								className="_iconMenu"
								onClick={() => changeEventFunction(selectedFunction, undefined)}
							>
								<i className="fa fa-regular fa-trash-can" />
							</div>
						)}
						<div className="_iconMenuSeperator" />
						{/* AI functionality buttons */}
						{!selectedFunction ? (
							<></>
						) : (
							<>
								<div
									title="AI: Explain this function"
									className={`_iconMenu ${aiLoading ? '_loading' : ''}`}
									onClick={handleExplainFunction}
								>
									<i className="fa-solid fa-lightbulb" />
								</div>
								<div
									title="AI: Modify this function"
									className={`_iconMenu ${aiLoading ? '_loading' : ''}`}
									onClick={() => {
										setShowAiDialog('modify');
										setAiError(null);
									}}
								>
									<i className="fa-solid fa-wand-magic-sparkles" />
								</div>
								<div className="_iconMenuSeperator" />
							</>
						)}
						{!selectedFunction ? (
							<></>
						) : (
							<div
								title="Copy this function"
								className="_iconMenu"
								onClick={() => {
									if (!ClipboardItem || !selectedFunction) return;

									navigator.clipboard.write([
										new ClipboardItem({
											'text/plain': new Blob(
												[
													COPY_FUNCTION_KEY +
														JSON.stringify({
															key: selectedFunction,
															functionDefinition:
																eventFunctions[selectedFunction],
														}),
												],
												{
													type: 'text/plain',
												},
											),
										}),
									]);
								}}
							>
								<i className="fa fa-regular fa-clipboard" />
							</div>
						)}
						<div
							title="Paste copied function / step"
							className="_iconMenu"
							onClick={() => {
								if (!ClipboardItem) return;
								navigator.clipboard.readText().then(data => {
									if (data.startsWith(COPY_FUNCTION_KEY)) {
										const functWithKey = JSON.parse(
											data.substring(COPY_FUNCTION_KEY.length),
										);

										const funct = functWithKey.functionDefinition;

										if (
											Object.values(eventFunctions).findIndex(
												(v: any) =>
													v.name === funct.name &&
													v.namespace === funct.namespace,
											) !== -1
										) {
											let name = funct.name + '_copy';
											let i = 0;
											while (
												Object.values(eventFunctions).findIndex(
													(v: any) => v.name === name,
												) !== -1
											) {
												i++;
												name = `${funct.name}_copy_${i}`;
											}

											funct.name = name;
										}

										changeEventFunction(
											eventFunctions[functWithKey.key]
												? shortUUID()
												: functWithKey.key,
											funct,
										);
									} else if (data.startsWith(COPY_STMT_KEY)) {
										if (!selectedFunction) return;

										const steps = data
											.split(COPY_STMT_KEY)
											.filter(e => e)
											.map(e => JSON.parse(e));
										if (!steps.length) return;
										let newFun = duplicate(eventFunctions[selectedFunction]);
										if (!newFun.steps) newFun.steps = {};

										const changes: Array<[string, string] | undefined> =
											steps.map(step => {
												let name: string = step.statementName;
												let i = 0;
												const oldStatementName: string = step.statementName;
												while (newFun.steps[name]) {
													i++;
													name = step.statementName + '_Copy_' + i;
												}
												step.position = {
													left: (step.position.left ?? 0) + 40 * i,
													top: (step.position.top ?? 0) + 40 * i,
												};
												step.statementName = name;
												newFun.steps[name] = step;
												if (oldStatementName == name) return undefined;
												return [oldStatementName, name];
											});

										changes.forEach(params => {
											if (!params) return;
											const [oldName, newName] = params;

											for (let step of steps) {
												const str = JSON.stringify(step);
												const newStr = str.replace(
													`Steps.${oldName}.`,
													`Steps.${newName}.`,
												);
												newFun.steps[step.statementName] =
													JSON.parse(newStr);
											}
										});

										changeEventFunction(selectedFunction, newFun);
									}
								});
							}}
						>
							<i className="fa fa-regular fa-paste" />
						</div>
						{!selectedFunction ? (
							<></>
						) : (
							<>
								<div className="_iconMenuSeperator" />
								<div
									className="_iconMenu"
									title="Validation trigger on the element"
								>
									<i className="fa-solid fa-check-double" />
								</div>
								<select
									className="_peSelect"
									value={eventFunctions[selectedFunction]?.validationCheck ?? ''}
									onChange={e => {
										let newFun = duplicate(eventFunctions[selectedFunction]);
										if (e.target.value === '') {
											delete newFun.validationCheck;
										} else {
											newFun.validationCheck = e.target.value;
										}
										changeEventFunction(selectedFunction, newFun);
									}}
								>
									<option value="">--None--</option>
									{Object.values(editPage?.componentDefinition ?? {})
										.sort((a: any, b: any) =>
											(a.name ?? a.key).localeCompare(b.name ?? b.key),
										)
										.map((e: any) => (
											<option key={e.key} value={e.key}>
												{e.name ?? e.key}
											</option>
										))}
								</select>
							</>
						)}
						<div className="_iconMenuSeperator" />
						<div className="_buttonBar">
							<i
								className={`fa fa-solid fa-left-long ${
									undoStackRef.current.length ? 'active' : ''
								}`}
								onClick={() => {
									if (!undoStackRef.current.length || !defPath) return;
									const x = undoStackRef.current[undoStackRef.current.length - 1];
									undoStackRef.current.splice(undoStackRef.current.length - 1, 1);
									redoStackRef.current.splice(0, 0, x);
									const pg = duplicate(
										undoStackRef.current.length
											? undoStackRef.current[undoStackRef.current.length - 1]
											: firstTimeRef.current[0],
									) as PageDefinition;
									pg.version = latestVersion.current;
									pg.isFromUndoRedoStack = true;
									if (
										selectedComponent &&
										!pg.componentDefinition[selectedComponent]
									) {
										onSelectedComponentChanged('');
										onSelectedSubComponentChanged('');
									}
									setData(defPath, pg, pageExtractor.getPageName());
									setChanged(Date.now());
								}}
								title="Undo"
							/>
							<i
								className={`fa fa-solid fa-right-long ${
									redoStackRef.current.length ? 'active' : ''
								}`}
								onClick={() => {
									if (!redoStackRef.current.length || !defPath) return;
									const x = redoStackRef.current[0];
									undoStackRef.current.push(x);
									redoStackRef.current.splice(0, 1);
									const pg = duplicate(
										undoStackRef.current.length
											? undoStackRef.current[undoStackRef.current.length - 1]
											: firstTimeRef.current[0],
									) as PageDefinition;
									pg.version = latestVersion.current;
									pg.isFromUndoRedoStack = true;
									if (
										selectedComponent &&
										!pg.componentDefinition[selectedComponent]
									) {
										onSelectedComponentChanged('');
										onSelectedSubComponentChanged('');
									}
									setData(defPath, pg, pageExtractor.getPageName());
									setChanged(Date.now());
								}}
								title="Redo"
							/>
						</div>
					</div>
					<div className="_codeButtons">
						<div className="_iconMenu" onClick={() => setFullScreen(!fullScreen)}>
							<i
								className={`fa fa-solid ${
									fullScreen
										? 'fa-down-left-and-up-right-to-center'
										: 'fa-up-right-and-down-left-from-center'
								}`}
							></i>
						</div>
						<div className="_iconMenu" onClick={() => onSetShowCodeEditor(undefined)}>
							<i className="fa fa-solid fa-close"></i>
						</div>
					</div>
				</div>
				<KIRunEditor.component
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					definition={{
						key: uuid,
						name: 'Code Editor',
						type: 'KIRunEditor',
						properties: {
							editorType: { value: 'page' },
							...definition.properties,
						},
						bindingPath: {
							type: 'VALUE',
							value: selectedFunction
								? `${defPath}.eventFunctions.${selectedFunction}`
								: '',
						},
						bindingPath2: {
							type: 'VALUE',
							value: `${personalizationPath}.kirunEditor`,
						},
					}}
					functionRepository={remoteFunctionRepository}
					schemaRepository={remoteSchemaRepository}
					functionKey={selectedFunction}
					tokenValueExtractors={tokenValueExtractors}
					stores={['Store', 'Page', 'Theme', 'LocalStore']}
					storePaths={storePaths}
					hideArguments={true}
				/>
			</div>
			
			{/* AI Dialog */}
			{showAiDialog && (
				<div className="_aiDialogOverlay" onClick={closeAiDialog}>
					<div className="_aiDialog" onClick={e => e.stopPropagation()}>
						<div className="_aiDialogHeader">
							<div className="_aiDialogTitle">
								<svg width="20" height="12" viewBox="0 0 136 83" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
									<path d="M76.0314 17.1742V7.37459L68.0056 0L59.9801 7.37459V17.1742C26.667 21.1066 0.384999 49.1784 0 83H0.0111617C5.5023 81.0767 10.9934 79.1525 16.4846 77.2283C19.3292 54.5598 37.2044 36.4823 59.9764 32.9995V60.7251L68.0093 55.1126L76.0237 60.7251V32.9995C98.7957 36.4823 116.674 54.5598 119.516 77.2283C125.006 79.1525 130.498 81.0767 135.989 83H136C135.615 49.1784 109.333 21.1066 76.0203 17.1742H76.0314Z" fill="#D97757"/>
								</svg>
								<i className={showAiDialog === 'explain' ? 'fa-solid fa-lightbulb' : 'fa-solid fa-wand-magic-sparkles'} />
								{showAiDialog === 'explain' ? 'AI Explanation' : 'AI Modify Function'}
							</div>
							<div className="_iconMenu" onClick={closeAiDialog}>
								<i className="fa-solid fa-close" />
							</div>
						</div>
						
						<div className="_aiDialogContent">
							{aiError && (
								<div className="_aiError">
									<i className="fa-solid fa-exclamation-circle" />
									{aiError}
								</div>
							)}
							
							{showAiDialog === 'explain' && (
								<>
									{aiLoading ? (
										<div className="_aiLoading">
											<i className="fa-solid fa-spinner fa-spin" />
											Analyzing function...
										</div>
									) : aiExplanation ? (
										<div className="_aiExplanation">
											<div className="_aiSummary">
												<strong>Summary:</strong> {aiExplanation.summary}
											</div>
											<div className="_aiFullExplanation">
												{aiExplanation.explanation}
											</div>
											{aiExplanation.steps && aiExplanation.steps.length > 0 && (
												<div className="_aiSteps">
													<strong>Steps:</strong>
													<ul>
														{aiExplanation.steps.map((step, idx) => (
															<li key={idx}>
																<strong>{step.name}:</strong> {step.description}
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									) : null}
								</>
							)}
							
							{showAiDialog === 'modify' && (
								<div className="_aiModifyForm">
									<label>Describe what you want to change:</label>
									<div className="_aiInputWrapper">
									<textarea
										className="_aiModifyInput"
										value={aiModifyPrompt}
										onChange={e => setAiModifyPrompt(e.target.value)}
										placeholder="e.g., Add error handling, Log the result to console, Add a condition to check if value is empty..."
										rows={4}
										disabled={aiLoading}
									/>
									</div>
									<div className="_aiModifyActions">
										<button
											className="_aiModifyButton"
											onClick={handleModifyFunction}
											disabled={aiLoading || !aiModifyPrompt.trim()}
										>
											{aiLoading ? (
												<>
													<i className="fa-solid fa-spinner fa-spin" />
													Modifying...
												</>
											) : (
												<>
													<i className="fa-solid fa-wand-magic-sparkles" />
													Apply Changes
												</>
											)}
										</button>
										<button
											className="_aiModifyCancelButton"
											onClick={closeAiDialog}
											disabled={aiLoading}
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
