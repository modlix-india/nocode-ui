import { duplicate, FunctionDefinition, Repository, Schema, SchemaType, SchemaUtil, isNullValue } from '@fincity/kirun-js';
import { setData ,UrlDetailsExtractor} from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { runEvent } from '../util/runEvent';

interface StringValue {
	isExpression: boolean;
	isValue: boolean;
	string?: string;
}

export function stringValue(paramValue: any): StringValue | undefined {
	if (paramValue === undefined) return undefined;

	const value = Object.values(paramValue)
		.filter(e => !isNullValue(e))
		.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
		.reduce(
			(a: StringValue, c: any) => ({
				isExpression: a.isExpression || c.type === 'EXPRESSION',
				isValue: a.isValue || c.type === 'VALUE',
				string:
					a.string +
					(a.string ? '\n' : '') +
					(c.type === 'EXPRESSION'
						? c.expression
						: typeof c.value === 'object'
							? JSON.stringify(c.value, undefined, 2)
							: c.value),
			}),
			{ isExpression: false, isValue: false, string: '' } as StringValue,
		);

	return value;
}

export function savePersonalizationCurry(
	personalizationPath: string,
	pageName: string,
	onChangePersonalization: any,
	locationHistory: Array<LocationHistory>,
	pageDefinition: PageDefinition,
) {
	if (!onChangePersonalization) return (key: string, value: any) => {};
	let handle: any = -1;

	return (key: string, value: any) => {
		if (handle !== -1) clearTimeout(handle);

		setData(`${personalizationPath}.${key}`, value, pageName);
		handle = setTimeout(() => {

			if (typeof onChangePersonalization == 'function') { 
				onChangePersonalization(); 
				return; 
			}

			(async () =>
				await runEvent(
					onChangePersonalization,
					'pageEditorSave',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}, 2000);
	};
}

export function correctStatementNames(def: any) {
	def = duplicate(def) ?? {};

	Object.keys(def?.steps ?? {}).forEach(k => {
		if (k === def.steps[k].statementName) return;

		let x = def.steps[k];
		delete def.steps[k];
		def.steps[x.statementName] = x;
	});

	return def;
}

export async function makeObjectPaths(
	prefix: string,
	schema: Schema,
	schemaRepository: Repository<Schema>,
	set: Set<string>,
): Promise<void> {
	let s: Schema | undefined = schema;
	if (!isNullValue(schema.getRef()))
		s = await SchemaUtil.getSchemaFromRef(s, schemaRepository, schema.getRef());

	if (
		isNullValue(s) ||
		!s?.getType()?.contains(SchemaType.OBJECT) ||
		isNullValue(s.getProperties())
	)
		return;

	for (const [propName, subSchema] of Array.from(s.getProperties()!)) {
		const path = prefix + '.' + propName;
		set.add(path);
		await makeObjectPaths(path, subSchema, schemaRepository, set);
	}
}

// Regex to find Steps references in expressions
const STEPS_REGEX = /Steps\.([a-zA-Z0-9_-]+)\./g;

/**
 * Extract step dependencies from a value (recursively handles objects and arrays)
 */
function extractStepDependencies(value: any, stepNames: Set<string>, deps: Set<string>): void {
	if (typeof value === 'string') {
		let match;
		STEPS_REGEX.lastIndex = 0;
		while ((match = STEPS_REGEX.exec(value)) !== null) {
			const depName = match[1];
			if (stepNames.has(depName)) {
				deps.add(depName);
			}
		}
	} else if (Array.isArray(value)) {
		for (const item of value) {
			extractStepDependencies(item, stepNames, deps);
		}
	} else if (value && typeof value === 'object') {
		for (const key of Object.keys(value)) {
			extractStepDependencies(value[key], stepNames, deps);
		}
	}
}

/**
 * Auto-layout function definition statements using a layered graph layout algorithm.
 * Groups statements into layers based on their dependencies and positions them in a grid.
 *
 * @param funcDef - The function definition to layout
 * @param nodeWidth - Width of each node for horizontal spacing
 * @param nodeHeight - Height of each node for vertical spacing
 * @param gap - Gap between nodes
 * @returns Map of statement names to their new positions
 */
export function autoLayoutFunctionDefinition(
	funcDef: FunctionDefinition,
	nodeWidth: number,
	nodeHeight: number,
	gap: number,
): Map<string, { left: number; top: number }> {
	const steps = funcDef.getSteps();
	const positions = new Map<string, { left: number; top: number }>();

	if (!steps.size) return positions;

	const stepNames = new Set(steps.keys());

	// Build dependency graph - map from statement name to its dependencies
	const dependsOn = new Map<string, Set<string>>();
	const dependedBy = new Map<string, Set<string>>();

	for (const [name] of steps) {
		dependsOn.set(name, new Set());
		dependedBy.set(name, new Set());
	}

	// Parse dependencies from dependentStatements and parameter expressions
	for (const [name, statement] of steps) {
		const deps = dependsOn.get(name)!;

		// 1. From explicit dependentStatements (format: "Steps.statementName.eventName")
		for (const [depPath] of statement.getDependentStatements()) {
			const parts = depPath.split('.');
			if (parts.length >= 2 && parts[0] === 'Steps') {
				const depName = parts[1];
				if (stepNames.has(depName) && depName !== name) {
					deps.add(depName);
				}
			}
		}

		// 2. From parameter map expressions
		const paramMap = statement.getParameterMap();
		for (const [, paramRefs] of paramMap) {
			for (const [, paramRef] of paramRefs) {
				// Check expression
				const expr = paramRef.getExpression();
				if (expr) {
					extractStepDependencies(expr, stepNames, deps);
				}
				// Check value (could contain expressions as strings)
				const val = paramRef.getValue();
				if (val !== undefined && val !== null) {
					extractStepDependencies(val, stepNames, deps);
				}
			}
		}

		// Remove self-reference
		deps.delete(name);

		// Update dependedBy map
		for (const depName of deps) {
			dependedBy.get(depName)?.add(name);
		}
	}

	// Assign layers using topological sort (Kahn's algorithm)
	const layers: string[][] = [];
	const inDegree = new Map<string, number>();
	const assigned = new Set<string>();

	for (const [name] of steps) {
		inDegree.set(name, dependsOn.get(name)?.size ?? 0);
	}

	while (assigned.size < steps.size) {
		// Find all nodes with no unprocessed dependencies
		const layer: string[] = [];
		for (const [name] of steps) {
			if (!assigned.has(name) && (inDegree.get(name) ?? 0) === 0) {
				layer.push(name);
			}
		}

		// Handle cycles - if no nodes found, pick one with minimum dependencies
		if (layer.length === 0) {
			let minDep = Infinity;
			let minNode = '';
			for (const [name] of steps) {
				if (!assigned.has(name)) {
					const deg = inDegree.get(name) ?? 0;
					if (deg < minDep) {
						minDep = deg;
						minNode = name;
					}
				}
			}
			if (minNode) layer.push(minNode);
		}

		if (layer.length === 0) break;

		// Sort layer alphabetically for consistent layout
		layer.sort((a, b) => a.localeCompare(b));
		layers.push(layer);

		// Mark as assigned and update degrees
		for (const name of layer) {
			assigned.add(name);
			for (const dependent of dependedBy.get(name) ?? []) {
				inDegree.set(dependent, (inDegree.get(dependent) ?? 1) - 1);
			}
		}
	}

	// Calculate positions - layers go left to right
	// Try to position nodes near their dependencies for better visual flow
	const startX = 50;
	const startY = 50;

	for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
		const layer = layers[layerIdx];
		const x = startX + layerIdx * (nodeWidth + gap);

		if (layerIdx === 0) {
			// First layer: just stack vertically
			for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
				const name = layer[nodeIdx];
				const y = startY + nodeIdx * (nodeHeight + gap);
				positions.set(name, { left: x, top: y });
			}
		} else {
			// For subsequent layers: position nodes near their dependencies
			const nodeYPositions: { name: string; targetY: number }[] = [];

			for (const name of layer) {
				const deps = dependsOn.get(name) ?? new Set();
				let targetY = startY;

				if (deps.size > 0) {
					// Calculate average Y of dependencies
					let sumY = 0;
					let count = 0;
					for (const depName of deps) {
						const depPos = positions.get(depName);
						if (depPos) {
							sumY += depPos.top;
							count++;
						}
					}
					if (count > 0) {
						targetY = sumY / count;
					}
				}

				nodeYPositions.push({ name, targetY });
			}

			// Sort by target Y position
			nodeYPositions.sort((a, b) => a.targetY - b.targetY);

			// Assign positions ensuring no overlap
			let lastY = startY - (nodeHeight + gap);
			for (const { name, targetY } of nodeYPositions) {
				// Ensure minimum spacing from previous node
				const minY = lastY + nodeHeight + gap;
				const y = Math.max(targetY, minY);
				positions.set(name, { left: x, top: y });
				lastY = y;
			}
		}
	}

	return positions;
}
