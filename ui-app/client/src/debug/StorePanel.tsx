import React, { useState, useCallback } from 'react';

// JSON Tree Node component for collapsible/expandable tree view
export function JsonTreeNode({ name, value, depth = 0, keyFilter = '' }: { name?: string; value: any; depth?: number; keyFilter?: string }) {
	const [expanded, setExpanded] = useState(depth < 2); // Auto-expand first 2 levels

	const isObject = value !== null && typeof value === 'object';
	const isArray = Array.isArray(value);
	const isEmpty = isObject && Object.keys(value).length === 0;

	// Check if this node or any of its children match the filter
	const matchesFilter = (key: string, val: any, filter: string): boolean => {
		if (!filter) return true;
		const lowerFilter = filter.toLowerCase();
		if (key.toLowerCase().includes(lowerFilter)) return true;
		if (val !== null && typeof val === 'object') {
			return Object.entries(val).some(([k, v]) => matchesFilter(k, v, filter));
		}
		return false;
	};

	// Check if a key directly matches the filter (not via children)
	const keyDirectlyMatches = (key: string, filter: string): boolean => {
		if (!filter) return false;
		return key.toLowerCase().includes(filter.toLowerCase());
	};

	const getValuePreview = (val: any): string => {
		if (val === null) return 'null';
		if (val === undefined) return 'undefined';
		if (typeof val === 'string') return `"${val.length > 50 ? val.slice(0, 50) + '...' : val}"`;
		if (typeof val === 'number' || typeof val === 'boolean') return String(val);
		if (Array.isArray(val)) return `Array(${val.length})`;
		if (typeof val === 'object') return `{${Object.keys(val).length} keys}`;
		return String(val);
	};

	const getValueClass = (val: any): string => {
		if (val === null || val === undefined) return '_null';
		if (typeof val === 'string') return '_string';
		if (typeof val === 'number') return '_number';
		if (typeof val === 'boolean') return '_boolean';
		return '';
	};

	if (!isObject || isEmpty) {
		return (
			<div className="_jsonTreeLeaf" style={{ paddingLeft: `${depth * 16}px` }}>
				{name !== undefined && <span className="_jsonKey">{name}: </span>}
				<span className={`_jsonValue ${getValueClass(value)}`}>
					{getValuePreview(value)}
				</span>
			</div>
		);
	}

	// Sort keys alphabetically for objects, keep original order for arrays
	// Apply key filter at depth 0 (root level only filters, children show all matching branches)
	const allEntries = isArray
		? Object.entries(value)
		: Object.entries(value).sort(([a], [b]) => a.localeCompare(b));

	const entries = depth === 0 && keyFilter
		? allEntries.filter(([key, val]) => matchesFilter(key, val, keyFilter))
		: allEntries;

	return (
		<div className="_jsonTreeNode">
			<div
				className="_jsonTreeHeader"
				style={{ paddingLeft: `${depth * 16}px` }}
				onClick={() => setExpanded(!expanded)}
			>
				<i className={`fa fa-chevron-${expanded ? 'down' : 'right'} _expandIcon`} />
				{name !== undefined && <span className="_jsonKey">{name}: </span>}
				<span className="_jsonBracket">
					{isArray ? '[' : '{'}
					{!expanded && (
						<span className="_jsonPreview">
							{entries.length} {isArray ? 'items' : 'keys'}
						</span>
					)}
					{!expanded && (isArray ? ']' : '}')}
				</span>
			</div>
			{expanded && (
				<div className="_jsonTreeChildren">
					{entries.map(([key, val]) => {
						// If this key directly matches the filter, don't pass filter to children
						// (show entire subtree without further filtering)
						const childFilter = keyDirectlyMatches(key, keyFilter) ? '' : keyFilter;
						return (
							<JsonTreeNode
								key={key}
								name={isArray ? `[${key}]` : key}
								value={val}
								depth={depth + 1}
								keyFilter={childFilter}
							/>
						);
					})}
					<div className="_jsonCloseBracket" style={{ paddingLeft: `${depth * 16}px` }}>
						{isArray ? ']' : '}'}
					</div>
				</div>
			)}
		</div>
	);
}

export interface StorePanelProps {
	storeData: any;
	onClose: () => void;
	title?: string;
	initialKeyFilter?: string;
	onKeyFilterChange?: (filter: string) => void;
}

export default function StorePanel({
	storeData,
	onClose,
	title = 'Store',
	initialKeyFilter = '',
	onKeyFilterChange,
}: StorePanelProps) {
	const [keyFilter, setKeyFilter] = useState(initialKeyFilter);

	const handleKeyFilterChange = useCallback((value: string) => {
		setKeyFilter(value);
		onKeyFilterChange?.(value);
	}, [onKeyFilterChange]);

	return (
		<div className="_debugStorePanel">
			<div className="_debugStorePanelHeader">
				<span className="_debugStorePanelTitle">
					<i className="fa fa-database" />
					{title}
				</span>
				<button
					className="_debugStorePanelClose _debugButtons"
					onClick={onClose}
					title={`Close ${title}`}
				>
					<i className="fa fa-times" />
				</button>
			</div>
			<div className="_debugStoreFilter">
				<i className="fa fa-search" />
				<input
					type="text"
					placeholder="Filter keys..."
					value={keyFilter}
					onChange={e => handleKeyFilterChange(e.target.value)}
					autoFocus
				/>
				{keyFilter && (
					<button
						className="_debugStoreFilterClear"
						onClick={() => handleKeyFilterChange('')}
						title="Clear filter"
					>
						<i className="fa fa-times" />
					</button>
				)}
			</div>
			<div className="_debugStorePanelContent">
				{storeData ? (
					<JsonTreeNode value={storeData} keyFilter={keyFilter} />
				) : (
					<div className="_debugStoreEmpty">
						<i className="fa fa-info-circle" />
						<span>No store data available</span>
					</div>
				)}
			</div>
		</div>
	);
}
