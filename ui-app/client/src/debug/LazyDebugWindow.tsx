import {
	DebugCollector,
	DebugEventType,
	ExecutionLog,
	HybridRepository,
	LogEntry,
	Repository,
	Schema,
} from '@fincity/kirun-js';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import PageDefintionFunctionsRepository from '../components/util/PageDefinitionFunctionsRepository';
import { getData, getDataFromPath, setData } from '../context/StoreContext';
import DebugWindowStyle from './DebugWindowStyle';
import { UIFunctionRepository } from '../functions';
import { UISchemaRepository } from '../schemas/common';
import { shortUUID } from '../util/shortUUID';
import axios from 'axios';
import StorePanel from './StorePanel';

const LazyKIRunEditor = React.lazy(
	() => import(/* webpackChunkName: "KIRunEditor" */ '../components/KIRunEditor/LazyKIRunEditor'),
);

interface ExecutionSummary {
	executionId: string;
	functionName: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	errored: boolean;
	stepCount: number;
	hasDefinitions: boolean;
}

// Count all steps including nested children
function countSteps(logs: LogEntry[]): number {
	let count = 0;
	for (const log of logs) {
		count += 1;
		if (log.children?.length) {
			count += countSteps(log.children);
		}
	}
	return count;
}

// Get the root function name from execution
function getRootFunctionName(execution: ExecutionLog): string {
	// Get from definitions - the first definition is typically the root function
	const definitionKeys = Array.from(execution.definitions.keys());
	if (definitionKeys.length > 0) {
		const key = definitionKeys[0];
		const definition = execution.definitions.get(key);

		// If definition exists, construct name with namespace
		if (definition) {
			const namespace = definition.namespace;
			const name = definition.name;
			// Only include namespace if it exists
			if (namespace) {
				return `${namespace}.${name}`;
			}
			return name;
		}

		return key;
	}
	// Fallback to first log entry
	const firstLog = execution.logs[0];
	return firstLog?.kirunFunctionName || firstLog?.functionName || 'Unknown';
}

let handle: NodeJS.Timeout | null = null;
function savePersonalization() {
    if (!getDataFromPath('Store.auth', [])) return;

    if (handle) clearTimeout(handle);
    const appName = getDataFromPath('Store.application.appCode', []);
    const token = getDataFromPath('Store.auth.accessToken', []);

    handle = setTimeout(() => axios.post(`api/ui/personalization/${appName}/debugger`,
        getDataFromPath('Store.debug.personalization', []),
        { headers: { Authorization: token } }
    ), 3000);
}

function loadPersonalization() {
    if (!getDataFromPath('Store.auth', [])) return;

    const appName = getDataFromPath('Store.application.appCode', []);
    const token = getDataFromPath('Store.auth.accessToken', []);

    axios.get(`api/ui/personalization/${appName}/debugger`, {headers : {
        Authorization: token
    }}).then(response => 
        setData('Store.debug.personalization', response.data),
    ).catch(() => {});
}

export default function LazyDebugWindow() {
	const uuid = useMemo(() => shortUUID(), []);
	const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isEnabled, setIsEnabled] = useState(DebugCollector.getInstance().isEnabled());
	const [selectedExecutionId, setSelectedExecutionId] = useState<string | undefined>(undefined);
	const [selectedExecutionLog, setSelectedExecutionLog] = useState<ExecutionLog | undefined>(
		undefined,
	);
	const [selectedFunctionName, setSelectedFunctionName] = useState<string | undefined>(undefined);
	const [showEditor, setShowEditor] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [storeKeyFilter, setStoreKeyFilter] = useState(
		() => getDataFromPath('Store.debug.preferences.storeKeyFilter', []) || ''
	);

	const handleStoreKeyFilterChange = useCallback((value: string) => {
		setStoreKeyFilter(value);
		setData('Store.debug.preferences.storeKeyFilter', value);
	}, []);

	// Build execution summaries from DebugCollector
	const refreshExecutions = useCallback(() => {
		const collector = DebugCollector.getInstance();
		const executionIds = collector.getAllExecutionIds();

		const summaries: ExecutionSummary[] = executionIds
			.map(id => {
				const log = collector.getExecution(id);
				if (!log) return null;

				const functionName = getRootFunctionName(log);

				return {
					executionId: id,
					functionName,
					startTime: log.startTime,
					endTime: log.endTime,
					duration: log.endTime ? log.endTime - log.startTime : undefined,
					errored: log.errored,
					stepCount: countSteps(log.logs),
					hasDefinitions: log.definitions.size > 0,
				} as ExecutionSummary;
			})
			.filter((s): s is ExecutionSummary => s !== null)
			.sort((a, b) => b.startTime - a.startTime); // Most recent first

		setExecutions(summaries);
	}, []);

	// Subscribe to debug events
	useEffect(() => {
		refreshExecutions();

		const unsubscribe = DebugCollector.getInstance().addEventListener(
			(event: { type: DebugEventType; executionId: string; data?: any }) => {
				// Refresh on relevant events
				if (
					event.type === 'executionStart' ||
					event.type === 'executionEnd' ||
					event.type === 'executionErrored'
				) {
					refreshExecutions();
				}
			},
		);

		return () => {
			unsubscribe();
		};
	}, [refreshExecutions]);

	const handleToggleDebug = useCallback(() => {
		const collector = DebugCollector.getInstance();
		if (collector.isEnabled()) {
			collector.disable();
			setIsEnabled(false);
		} else {
			collector.enable();
			setIsEnabled(true);
		}
	}, []);

	const handleClearAll = useCallback(() => {
		DebugCollector.getInstance().clear();
		refreshExecutions();
		setSelectedExecutionId(undefined);
		setSelectedExecutionLog(undefined);
		setSelectedFunctionName(undefined);
		setShowEditor(false);
	}, [refreshExecutions]);

	const handleSelectExecution = useCallback((exec: ExecutionSummary) => {
		const log = DebugCollector.getInstance().getExecution(exec.executionId);
		setSelectedExecutionId(exec.executionId);
		setSelectedExecutionLog(log);
		setSelectedFunctionName(exec.functionName);

		// Show editor if we have definitions
		if (exec.hasDefinitions && log?.definitions.size) {
			setShowEditor(true);
		}
	}, []);

	const handleSelectFunction = useCallback((functionName: string) => {
		setSelectedFunctionName(functionName);
	}, []);

	const handleCloseEditor = useCallback(() => {
		setShowEditor(false);
		setSelectedExecutionId(undefined);
		setSelectedExecutionLog(undefined);
		setSelectedFunctionName(undefined);
	}, []);

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	};

	const formatDuration = (ms: number | undefined) => {
		if (ms === undefined) return 'Running...';
		if (ms < 1) return '<1ms';
		if (ms < 1000) return `${Math.round(ms)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	// Get the selected execution's summary
	const selectedExecution = useMemo(() => {
		if (!selectedExecutionId) return undefined;
		return executions.find(e => e.executionId === selectedExecutionId);
	}, [selectedExecutionId, executions]);

	// Get function definition from execution log's definitions
	const selectedDefinition = useMemo(() => {
		if (!selectedExecutionLog || !selectedFunctionName) 
            return undefined;
		return selectedExecutionLog.definitions.get(selectedFunctionName);
	}, [selectedExecutionId, selectedExecutionLog, selectedFunctionName]);

	// Get all function names from the execution's definitions
	const availableFunctions = useMemo(() => {
		if (!selectedExecutionLog) return [];
		return Array.from(selectedExecutionLog.definitions.keys());
	}, [selectedExecutionLog]);

	// Get store data from globalThis.getStore()
	const storeData = useMemo(() => {
		if (!showStore) return null;
		try {
			return (globalThis as any).getStore?.() ?? null;
		} catch {
			return null;
		}
	}, [showStore]);

    useEffect(() => loadPersonalization(), [getDataFromPath('Store.auth', [])]);

	if (isCollapsed) {
		return (
			<>
				<DebugWindowStyle />
				<button className="_debugWindowCollapsed" onClick={() => setIsCollapsed(false)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>
					{executions.length > 0 && (
						<span className="_executionCount">{executions.length}</span>
					)}
				</button>
			</>
		);
	}

	const storeContainer = showStore ? (
		<StorePanel
			storeData={storeData}
			onClose={() => setShowStore(false)}
			initialKeyFilter={storeKeyFilter}
			onKeyFilterChange={handleStoreKeyFilterChange}
		/>
	) : null;

	// Show expanded editor view when an execution is selected
	if (showEditor && selectedExecution && selectedExecutionLog) {
		return (
			<>
				<DebugWindowStyle />
				<div className="_debugWindowExpanded">
					<div className="_debugHeader">
						<div className="_debugTitle">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>
							<span>{selectedFunctionName || selectedExecution.functionName}</span>
							<span className="_executionDuration">
								{formatDuration(selectedExecution.duration)}
							</span>
						</div>
						<div className="_debugActions">
							<button
								className={`_debugStoreBtn ${showStore ? '_active' : ''}`}
								onClick={() => setShowStore(!showStore)}
								title={showStore ? 'Hide Store' : 'View Store'}
							>
								<i className="fa fa-database" />
							</button>
							<button
								className="_debugClose"
								onClick={handleCloseEditor}
								title="Back to list"
							>
								<i className="fa fa-arrow-left" />
							</button>
							<button
								className="_debugCollapse"
								onClick={() => setIsCollapsed(true)}
								title="Collapse"
							>
								<i className="fa fa-chevron-down" />
							</button>
						</div>
					</div>

					{/* Function selector when multiple definitions exist */}
					{availableFunctions.length > 1 && (
						<div className="_debugFunctionSelector">
							{availableFunctions.map(funcName => (
								<button
									key={funcName}
									className={`_debugFunctionTab ${funcName === selectedFunctionName ? '_selected' : ''}`}
									onClick={() => handleSelectFunction(funcName)}
								>
									{funcName}
								</button>
							))}
						</div>
					)}

					<div className="_debugEditorContainer">
						<Suspense fallback={<div className="_debugLoading">Loading editor...</div>}>
							{selectedDefinition ? (
								<LazyKIRunEditor
									context={{
										pageName:
											getDataFromPath('Store.urlDetails.pageName', []) || '',
										shellPageName:
											getDataFromPath('Store.urlDetails.pageName', []) || '',
										level: 0,
									}}
									pageDefinition={
										globalThis.debugContext[selectedExecutionId!]
											?.pageDefinition
									}
									locationHistory={
										globalThis.debugContext[selectedExecutionId!]
											?.locationHistory
									}
									definition={{
										key: uuid,
										name: 'Code Editor',
										type: 'KIRunEditor',
										properties: {
											editorType: { value: 'page' },
										},
                                        bindingPath2: {
                                            type: 'VALUE',
                                            value: 'Store.debug.personalization.kirunEditor',
                                        },
									}}
									debugViewMode={true}
									executionLog={selectedExecutionLog}
									functionRepository={
										globalThis.debugContext[selectedExecutionId!]
											?.functionRepository
									}
									schemaRepository={
										globalThis.debugContext[selectedExecutionId!]
											?.schemaRepository
									}
									tokenValueExtractors={
										globalThis.debugContext[selectedExecutionId!]
											?.tokenValueExtractors
									}
									stores={['Store', 'Page', 'Theme', 'LocalStore']}
                                    functionDefinition = {selectedDefinition}
                                    onChangePersonalizationFunction={savePersonalization}
								/>
							) : (
								<div className="_debugNoDefinition">
									<i className="fa fa-info-circle" />
									<span>No function definition available for this execution</span>
								</div>
							)}
						</Suspense>
                        {storeContainer}
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<DebugWindowStyle />
			<div className="_debugWindow">
				<div className="_debugHeader">
					<div className="_debugTitle">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>
						<span>Debug Executions</span>
					</div>
					<div className="_debugActions">
						<button
							className={`_debugToggle ${isEnabled ? '_enabled' : '_disabled'}`}
							onClick={handleToggleDebug}
							title={isEnabled ? 'Disable Debug Mode' : 'Enable Debug Mode'}
						>
							<i className={`fa ${isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}`} />
						</button>
						<button
							className="_debugClear"
							onClick={handleClearAll}
							title="Clear All Executions"
						>
							<i className="fa fa-trash" />
						</button>
						<button
							className="_debugCollapse"
							onClick={() => setIsCollapsed(true)}
							title="Collapse"
						>
							<i className="fa fa-chevron-down" />
						</button>
					</div>
				</div>

				<div className="_debugExecutionList">
					{executions.length === 0 ? (
						<div className="_debugEmptyState">
							<i className="fa fa-info-circle" />
							<span>No executions recorded</span>
							{!isEnabled && (
								<span className="_debugHint">
									Enable debug mode to start recording
								</span>
							)}
						</div>
					) : (
						executions.map(exec => {
							const statusIcon = exec.errored
								? 'fa-exclamation-circle'
								: exec.endTime
									? 'fa-check-circle'
									: 'fa-spinner fa-spin';
							return (
								<button
									key={exec.executionId}
									className={`_debugExecutionItem ${
										selectedExecutionId === exec.executionId ? '_selected' : ''
									} ${exec.errored ? '_errored' : ''}`}
									onClick={() => handleSelectExecution(exec)}
								>
									<div className="_executionMain">
										<div className="_executionIcon">
											<i className={`fa ${statusIcon}`} />
										</div>
										<div className="_executionDetails">
											<div className="_executionFunctionName">
												{exec.functionName}
											</div>
											<div className="_executionMeta">
												<span className="_executionTime">
													{formatTime(exec.startTime)}
												</span>
												<span className="_executionDuration">
													{formatDuration(exec.duration)}
												</span>
												<span className="_executionSteps">
													{exec.stepCount} steps
												</span>
											</div>
										</div>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>
		</>
	);
}
