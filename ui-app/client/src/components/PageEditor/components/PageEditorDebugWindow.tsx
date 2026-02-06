import { Function, HybridRepository, LogEntry, Repository, Schema } from '@fincity/kirun-js';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { getDataFromPath } from '../../../context/StoreContext';
import StorePanel from '../../../debug/StorePanel';
import { REPO_SERVER, RemoteRepository } from '../../../Engine/RemoteRepository';
import { UIFunctionRepository } from '../../../functions';
import { UISchemaRepository } from '../../../schemas/common';
import { shortUUID } from '../../../util/shortUUID';
import PageDefintionFunctionsRepository from '../../util/PageDefinitionFunctionsRepository';
import { DesktopIcon, MobileIcon, TabletIcon } from '../editors/DnDEditor/DnDIFrame';

const LazyKIRunEditor = React.lazy(
	() => import(/* webpackChunkName: "KIRunEditor" */ '../../KIRunEditor/LazyKIRunEditor'),
);

let UI_FUN_REPO: UIFunctionRepository;
let UI_SCHEMA_REPO: UISchemaRepository;

interface ExecutionSummary {
	executionId: string;
	functionName: string;
	eventName: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	errored: boolean;
	stepCount: number;
	screenType: string;
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
function getRootFunctionName(execution: any): string {
	// Get from definitions - the first definition is typically the root function
	// Handle both Map (from DebugCollector) and plain object (from postMessage)
	const definitions = execution.definitions instanceof Map
		? execution.definitions
		: new Map(Object.entries(execution.definitions || {}));

	const definitionKeys = Array.from(definitions.keys());
	if (definitionKeys.length > 0) {
		const key = definitionKeys[0];
		const definition = definitions.get(key);

		if (definition) {
			const namespace = definition.namespace;
			const name = definition.name;
			if (namespace) {
				return `${namespace}.${name}`;
			}
			return name;
		}

		return key as string;
	}
	// Fallback to first log entry
	const firstLog = execution.logs?.[0];
	return firstLog?.kirunFunctionName || firstLog?.functionName || 'Unknown';
}

// Extract event name from execution ID (format: eventKey_uuid)
function getEventName(executionId: string): string {
	const lastUnderscore = executionId.lastIndexOf('_');
	if (lastUnderscore > 0) {
		return executionId.substring(0, lastUnderscore);
	}
	return executionId;
}

// Get icon class for device type
function getDeviceIcon(device: string) {
	switch (device.toUpperCase()) {
		case 'DESKTOP': return <DesktopIcon isActive={true} />;
		case 'TABLET': return <TabletIcon isActive={true} />;
		case 'MOBILE': return <MobileIcon isActive={true} />;
		default: return <></>;
	}
}

interface PageEditorDebugWindowProps {
	executions: any[]; // Flattened execution messages from all devices
	onClose: () => void;
	onClearAll: () => void;
	slaveStore: {desktop: any, tablet: any, mobile: any};
	savePersonalization: () => void;
	personalizationPath: string | undefined;
}

export default function PageEditorDebugWindow({ executions: propsExecutions, onClose, onClearAll, slaveStore, savePersonalization, personalizationPath }: PageEditorDebugWindowProps) {
	if (!UI_FUN_REPO) UI_FUN_REPO = new UIFunctionRepository();
	if (!UI_SCHEMA_REPO) UI_SCHEMA_REPO = new UISchemaRepository();

	// State for selected execution
	const [selectedExecution, setSelectedExecution] = React.useState<string | null>(null);
	const [selectedFunctionName, setSelectedFunctionName] = React.useState<string | null>(null);
	const [showEditor, setShowEditor] = React.useState(false);
	const [fullScreen, setFullScreen] = React.useState(false);
	const [showStore, setShowStore] = React.useState(false);
	const [storeKeyFilter, setStoreKeyFilter] = React.useState('');
	const uuid = useMemo(() => shortUUID(), []);

	// Get the selected execution's full data - MUST be before useEffect that uses it
	const selectedExecutionData = useMemo(() => {
		if (!selectedExecution) return undefined;
		return propsExecutions.find(e => e.executionId === selectedExecution);
	}, [selectedExecution, propsExecutions]);

	// Set up repositories for KIRunEditor
	const [functionRepository, setFunctionRepository] = useState<Repository<Function>>(
		new HybridRepository(UI_FUN_REPO),
	);
	const [schemaRepository, setSchemaRepository] = useState<Repository<Schema>>(UI_SCHEMA_REPO);

	// Update repositories when selected execution changes
	useEffect(() => {
		if (!selectedExecutionData) return;

		// Get pageDefinition from the message data (not from globalThis)
		const pageDefinition = selectedExecutionData.pageDefinition;

		if (pageDefinition?.appCode && pageDefinition?.clientCode) {
			setFunctionRepository(
				new HybridRepository<Function>(
					UI_FUN_REPO,
					new PageDefintionFunctionsRepository(pageDefinition),
					RemoteRepository.getRemoteFunctionRepository(
						pageDefinition.appCode,
						pageDefinition.clientCode,
						false,
						REPO_SERVER.CORE,
					),
					RemoteRepository.getRemoteFunctionRepository(
						pageDefinition.appCode,
						pageDefinition.clientCode,
						false,
						REPO_SERVER.UI,
					),
				),
			);
			setSchemaRepository(
				new HybridRepository<Schema>(
					UI_SCHEMA_REPO,
					RemoteRepository.getRemoteSchemaRepository(
						pageDefinition.appCode,
						pageDefinition.clientCode,
						false,
						REPO_SERVER.CORE,
					),
					RemoteRepository.getRemoteSchemaRepository(
						pageDefinition.appCode,
						pageDefinition.clientCode,
						false,
						REPO_SERVER.UI,
					),
				),
			);
		}
	}, [selectedExecutionData, selectedExecution]);

	// Convert flattened messages to ExecutionSummary format
	const executions = useMemo<ExecutionSummary[]>(() => {
		return propsExecutions
			.map(msg => {
				const functionName = getRootFunctionName(msg);
				const eventName = getEventName(msg.executionId);

				return {
					executionId: msg.executionId,
					functionName,
					eventName,
					startTime: msg.startTime,
					endTime: msg.endTime,
					duration: msg.endTime ? msg.endTime - msg.startTime : undefined,
					errored: msg.errored,
					stepCount: countSteps(msg.logs || []),
					screenType: msg.screenType,
				} as ExecutionSummary;
			})
			.sort((a, b) => b.startTime - a.startTime); // Most recent first
	}, [propsExecutions]);

	// Group executions by device (screenType)
	const executionsByDevice = useMemo(() => {
		const grouped = new Map<string, ExecutionSummary[]>();
		for (const exec of executions) {
			const device = exec.screenType || 'Unknown';
			if (!grouped.has(device)) {
				grouped.set(device, []);
			}
			grouped.get(device)!.push(exec);
		}
		// Sort devices: Desktop, Tablet, Mobile, then any others
		const deviceOrder = ['Desktop', 'Tablet', 'Mobile'];
		const sortedDevices = Array.from(grouped.keys()).sort((a, b) => {
			const aIndex = deviceOrder.indexOf(a);
			const bIndex = deviceOrder.indexOf(b);
			if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
		return { grouped, sortedDevices };
	}, [executions]);

	const handleClearAll = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		onClearAll();
	}, [onClearAll]);

	const handleSelectExecution = useCallback((exec: ExecutionSummary) => {
		// Find the full execution data
		const fullExec = propsExecutions.find(e => e.executionId === exec.executionId);
		if (!fullExec) return;

		setSelectedExecution(exec.executionId);

		// Check if we have definitions
		const definitionsObj = fullExec.definitions || {};
		const definitionKeys = Object.keys(definitionsObj);

		if (definitionKeys.length > 0) {
			// Set the first function as selected
			setSelectedFunctionName(definitionKeys[0]);
			setShowEditor(true);
		} else {
			setShowEditor(false);
		}
	}, [propsExecutions]);

	const handleCloseEditor = useCallback(() => {
		setShowEditor(false);
		setSelectedExecution(null);
		setSelectedFunctionName(null);
	}, []);

	// Get function definition from execution's definitions
	const selectedDefinition = useMemo(() => {
		if (!selectedExecutionData || !selectedFunctionName) return undefined;
		const definitions = selectedExecutionData.definitions || {};
		return definitions[selectedFunctionName];
	}, [selectedExecutionData, selectedFunctionName]);

	// Get all function names from the execution's definitions
	const availableFunctions = useMemo(() => {
		if (!selectedExecutionData) return [];
		return Object.keys(selectedExecutionData.definitions || {});
	}, [selectedExecutionData]);

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

	// Get the store data based on the selected execution's device type
	const currentStoreData = useMemo(() => {
		if (!showStore || !selectedExecutionData) return null;
		const deviceType = selectedExecutionData.screenType?.toLowerCase();
		switch (deviceType) {
			case 'desktop': return slaveStore?.desktop;
			case 'tablet': return slaveStore?.tablet;
			case 'mobile': return slaveStore?.mobile;
			default: return null;
		}
	}, [showStore, selectedExecutionData, slaveStore]);

	// Get title for the store panel based on device
	const storePanelTitle = useMemo(() => {
		if (!selectedExecutionData) return 'Store';
		const deviceType = selectedExecutionData.screenType.substring(0,1).toUpperCase() + 
		selectedExecutionData.screenType.substring(1);
		return `${deviceType} Store`;
	}, [selectedExecutionData]);

	// Store panel component
	const storeContainer = showStore && selectedExecutionData ? (
		<StorePanel
			storeData={currentStoreData?.store}
			onClose={() => setShowStore(false)}
			title={storePanelTitle}
			initialKeyFilter={storeKeyFilter}
			onKeyFilterChange={setStoreKeyFilter}
		/>
	) : null;

	// Show editor view if an execution is selected
	if (showEditor && selectedExecutionData) {
		return (
			<>
				<div className="_popupMenuBackground" onClick={handleCloseEditor}>
					<div className='_codeEditor show'>
					<div className={`_codeEditorContent ${fullScreen ? '_fullScreen' : ''}`} onClick={e => e.stopPropagation()}>
						<div className="_executionListHeader">
						<h3>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-9"></path><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"></path><path d="M14.12 3.88 16 2"></path><path d="M21 21a4 4 0 0 0-3.81-4"></path><path d="M21 5a4 4 0 0 1-3.55 3.97"></path><path d="M22 13h-4"></path><path d="M3 21a4 4 0 0 1 3.81-4"></path><path d="M3 5a4 4 0 0 0 3.55 3.97"></path><path d="M6 13H2"></path><path d="m8 2 1.88 1.88"></path><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"></path></svg>
							Execution: {getRootFunctionName(selectedExecutionData)}
						</h3>
						<div className="_executionListActions">
							<button
								className={`_iconButton _debugButtons ${showStore ? '_active' : ''}`}
								onClick={() => setShowStore(!showStore)}
								title={showStore ? 'Hide Store' : 'View Store'}
							>
								<i className="fa fa-database" />
							</button>
							<button
								className="_iconButton _debugButtons"
								onClick={handleCloseEditor}
								title="Back to list"
							>
								<i className="fa fa-arrow-left" />
							</button>
							<button
								className="_iconButton _debugButtons"
								onClick={() => setFullScreen(!fullScreen)}
								title={fullScreen ? "Minimize" : "Maximize"}
							>
								<i className={`fa fa-solid ${fullScreen ? 'fa-down-left-and-up-right-to-center' : 'fa-up-right-and-down-left-from-center'}`} />
							</button>
							<button
								className="_closeButton"
								onClick={onClose}
								title="Close"
							>
								×
							</button>
						</div>
					</div>

					{/* Function selector when multiple definitions exist */}
					{availableFunctions.length > 1 && (
						<div className="_debugFunctionSelector">
							{availableFunctions.map(funcName => (
								<a
									key={funcName}
									className={`_debugFunctionTab ${funcName === selectedFunctionName ? '_selected' : ''}`}
									onClick={() => setSelectedFunctionName(funcName)}
								>
									{funcName}
								</a>
							))}
						</div>
					)}

					<div className="_debugEditorContainer">
						<Suspense fallback={<div className="_debugLoading">Loading editor...</div>}>
							{selectedDefinition ? (
								<LazyKIRunEditor
									context={{
										pageName: getDataFromPath('Store.urlDetails.pageName', []) || '',
										shellPageName: getDataFromPath('Store.urlDetails.pageName', []) || '',
										level: 0,
									}}
									pageDefinition={selectedExecutionData.pageDefinition}
									locationHistory={selectedExecutionData.locationHistory || []}
									definition={{
										key: uuid,
										name: 'Code Editor',
										type: 'KIRunEditor',
										properties: {
											editorType: { value: 'page' },
										},
										bindingPath2: {
											type: 'VALUE',
											value: `${personalizationPath}.debug.kirunEditor`,
										},
									}}
									debugViewMode={true}
									executionLog={selectedExecutionData}
									functionRepository={functionRepository}
									schemaRepository={schemaRepository}
									tokenValueExtractors={
										(globalThis as any).debugContext?.[selectedExecution!]?.tokenValueExtractors
									}
									stores={['Store', 'Page', 'Theme', 'LocalStore']}
									functionDefinition={selectedDefinition}
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
				</div>
			</div>
			</>
		);
	}

	return (
		<>
			<div className="_popupMenuBackground" onClick={onClose}>
				<div className="_executionListMenu" onClick={e => e.stopPropagation()}>
				<div className="_executionListHeader">
					<h3>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-9"></path><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"></path><path d="M14.12 3.88 16 2"></path><path d="M21 21a4 4 0 0 0-3.81-4"></path><path d="M21 5a4 4 0 0 1-3.55 3.97"></path><path d="M22 13h-4"></path><path d="M3 21a4 4 0 0 1 3.81-4"></path><path d="M3 5a4 4 0 0 0 3.55 3.97"></path><path d="M6 13H2"></path><path d="m8 2 1.88 1.88"></path><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"></path></svg>
						Debug Executions
					</h3>
					<div className="_executionListActions">
						<button
							className="_iconButton _debugButtons"
							onClick={handleClearAll}
							title="Clear All Executions"
						>
							<i className="fa fa-trash" />
						</button>
						<button
							className="_closeButton"
							onClick={onClose}
							title="Close"
						>
							×
						</button>
					</div>
				</div>
				<div className="_executionListContent">
					{executions.length === 0 ? (
						<div className="_emptyState">
							<i className="fa fa-info-circle" style={{ fontSize: '24px', marginBottom: '8px' }} />
							<div>No executions recorded</div>
						</div>
					) : (
						executionsByDevice.sortedDevices.map(device => (
							<div key={device} className="_deviceGroup">
								<div className="_deviceHeader">
									{getDeviceIcon(device)}
									<span>{device.toUpperCase()}</span>
									<span className="_deviceCount">{executionsByDevice.grouped.get(device)?.length || 0}</span>
								</div>
								{executionsByDevice.grouped.get(device)?.map(exec => (
									<div
										key={exec.executionId}
										className="_executionListItem"
										onClick={() => handleSelectExecution(exec)}
									>
										<span className={`_status ${exec.errored ? '_error' : '_success'}`}>
											{exec.errored ? '✗' : '✓'}
										</span>
										<div className="_executionInfo">
											<div className="_functionName">{exec.functionName}</div>
											<div className="_eventName">Event: {exec.eventName}</div>
										</div>
										<div className="_executionMeta">
											<span className="_timestamp">{formatTime(exec.startTime)}</span>
											<span className="_duration">{formatDuration(exec.duration)}</span>
											<span className="_steps">{exec.stepCount} steps</span>
										</div>
									</div>
								))}
							</div>
						))
					)}
				</div>
			</div>
		</div>
		</>
	);
}
