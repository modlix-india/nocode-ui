import React from 'react';

interface DebugExecutionListProps {
	messages: any[];
	device: string;
	onSelectExecution: (executionId: string) => void;
	onClose: () => void;
	onReset: () => void;
}

export default function DebugExecutionList({
	messages,
	device,
	onSelectExecution,
	onClose,
	onReset,
}: DebugExecutionListProps) {
	const formatDuration = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const getFunctionName = (msg: any) => {
		// Try to get function name from the root log entry
		const functionName = msg.logs?.[0]?.functionName || 'Unknown';
		console.log('[DEBUG] DebugExecutionList getting function name:', {
			executionId: msg.executionId,
			logsLength: msg.logs?.length,
			firstLog: msg.logs?.[0],
			functionName,
			allMsgKeys: Object.keys(msg),
		});
		return functionName;
	};

	const getEventName = (msg: any) => {
		// Extract event key from execution ID (format: eventKey_uuid)
		if (msg.executionId) {
			return msg.executionId.substring(0, msg.executionId.lastIndexOf('_'));
		}
		return 'Unknown';
	};

	const getDuration = (msg: any) => {
		if (msg.endTime && msg.startTime) {
			return msg.endTime - msg.startTime;
		}
		return 0;
	};

	return (
		<div className="_popupMenuBackground" onClick={onClose}>
			<div className="_executionListMenu" onClick={e => e.stopPropagation()}>
				<div className="_executionListHeader">
					<h3>
						Debug Executions - {device.charAt(0).toUpperCase() + device.slice(1)}
					</h3>
					<div className="_executionListActions">
						<button className="_resetButton" onClick={onReset}>
							Reset
						</button>
						<button className="_closeButton" onClick={onClose}>
							×
						</button>
					</div>
				</div>
				<div className="_executionListContent">
					{messages.length === 0 ? (
						<div className="_emptyState">No executions yet</div>
					) : (
						messages.map(msg => (
							<div
								key={msg.executionId}
								className="_executionListItem"
								onClick={() => onSelectExecution(msg.executionId)}
							>
								<span className={`_status ${msg.errored ? '_error' : '_success'}`}>
									{msg.errored ? '✗' : '✓'}
								</span>
								<div className="_executionInfo">
									<div className="_functionName">{getFunctionName(msg)}</div>
									<div className="_eventName">Event: {getEventName(msg)}</div>
								</div>
								<div className="_executionMeta">
									<span className="_timestamp">
										{new Date(msg.startTime).toLocaleTimeString()}
									</span>
									<span className="_duration">{formatDuration(getDuration(msg))}</span>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
