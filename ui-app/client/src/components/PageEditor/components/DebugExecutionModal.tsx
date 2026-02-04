import React, { lazy, Suspense, useEffect } from 'react';
import { DebugCollector } from '@fincity/kirun-js';

const LazyDebugWindow = lazy(() => import('../../../debug/LazyDebugWindow'));

interface DebugExecutionModalProps {
	executionId: string;
	message: any; // Contains executionLog, functionDefinition, etc.
	onClose: () => void;
}

export default function DebugExecutionModal({
	executionId,
	message,
	onClose,
}: DebugExecutionModalProps) {
	// Inject the execution log into DebugCollector so LazyDebugWindow can display it
	useEffect(() => {
		if (!message?.executionLog) return;

		const collector = DebugCollector.getInstance();

		// Convert plain object definitions back to Map
		const executionLog = {
			...message.executionLog,
			definitions: new Map(Object.entries(message.executionLog.definitions || {})),
		};

		// Temporarily store the execution in the collector
		// We use a private API here - the collector stores executions internally
		// Since we can't directly inject, we'll enable the collector and it will pick up from global context
		collector.enable();

		// Store in global debug context for LazyDebugWindow to access
		if (typeof globalThis !== 'undefined') {
			if (!globalThis.debugContext) {
				globalThis.debugContext = {};
			}
			globalThis.debugContext[executionId] = {
				executionLog: executionLog,
				// Add minimal context needed for display
				pageDefinition: null,
				functionRepository: null,
				schemaRepository: null,
				locationHistory: [],
				tokenValueExtractors: new Map(),
			};
		}

		return () => {
			// Clean up on unmount
			if (globalThis.debugContext?.[executionId]) {
				delete globalThis.debugContext[executionId];
			}
		};
	}, [executionId, message]);

	return (
		<div className="_debugModalBackground" onClick={onClose}>
			<div className="_debugModalContent" onClick={e => e.stopPropagation()}>
				<button className="_debugModalClose" onClick={onClose}>
					×
				</button>
				<Suspense fallback={<div className="_debugModalLoading">Loading debug viewer...</div>}>
					<LazyDebugWindow />
				</Suspense>
			</div>
		</div>
	);
}
