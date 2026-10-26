import {
	AbstractFunction,
	DebugCollector,
	Event,
	EventResult,
	ExecutionGraph,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	HybridRepository,
	KIRunFunctionRepository,
	KIRunSchemaRepository,
	KIRuntime,
	LogEntry,
	Namespaces,
	Parameter,
	Repository,
	Schema,
	StatementExecution,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { errorMessage, toPlain, withResult } from './plain';

const SIGNATURE = new FunctionSignature('RunKIRun')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('definition', Schema.ofAny('definition')),
			Parameter.ofEntry('arguments', Schema.ofAny('arguments').setDefaultValue({})), // object or JSON text
			Parameter.ofEntry('debug', Schema.ofBoolean('debug').setDefaultValue(true)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['events', Schema.ofArray('events', Schema.ofAny('event'))],
					['console', Schema.ofArray('console', Schema.ofString('line'))],
					['log', Schema.ofArray('log', Schema.ofAny('entry'))],
					[
						'plan',
						Schema.ofArray('plan', Schema.ofArray('level', Schema.ofString('step'))),
					],
					['error', Schema.ofAny('error')],
					['ms', Schema.ofNumber('ms')],
					['result', Schema.ofAny('result')],
				]),
			),
		]),
	)
	.setDescription(
		'Runs a function definition in the browser, sandboxed to the KIRun built-ins, and returns its events, console output, step trace and execution plan',
	)
	.setDocumentation(
		"# UIEngine.RunKIRun\n\nRuns a KIRun function definition (the stored JSON) right here in the browser on kirun-js and returns everything a playground needs to show what happened.\n\n**Sandboxed:** the definition can call only the KIRun built-ins (`System.*`). UIEngine functions and server functions are not available to it, so a pasted or shared definition cannot act with the viewer's session. `System.Print` is captured into `console` instead of the browser console.\n\n## Parameters\n\n- **definition** (Object, required): the function definition JSON\n- **arguments** (Object or String): argument values by parameter name, or the same as JSON text (default `{}`)\n- **debug** (Boolean): record the step trace (default `true`)\n\n## Events\n\n- **output**, always raised, even when the run fails:\n  - `events` (Array): each event the function raised, as `{name, result}`\n  - `console` (Array of String): lines written by `System.Print`\n  - `log` (Array): the step trace, one entry per step run, with `statementName`, `functionName`, `arguments`, `result`, `eventName`, `duration`, `error` and nested `children`\n  - `plan` (Array of Array of String): steps grouped by level of the execution graph; steps in one level do not depend on each other and run in parallel\n  - `error` (Object or null): `{message, step}` when the run failed\n  - `ms` (Number): wall time of the run in milliseconds\n  - `result` (Object): all of the above as one plain object, for `SetStore` (`Steps.<step>.output` itself is a Map and does not store as JSON)",
	);

/** System.Print, writing to a buffer instead of the browser console. */
class CapturedPrint extends AbstractFunction {
	private readonly signature = new FunctionSignature('Print')
		.setNamespace(Namespaces.SYSTEM)
		.setParameters(
			new Map([
				Parameter.ofEntry('values', Schema.ofAny('values'), true),
				Parameter.ofEntry(
					'stream',
					Schema.ofString('stream').setEnums(['LOG', 'ERROR']).setDefaultValue('LOG'),
				),
			]),
		)
		.setEvents(new Map([Event.outputEventMapEntry(new Map())]));

	constructor(private readonly lines: string[]) {
		super();
	}

	getSignature(): FunctionSignature {
		return this.signature;
	}

	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const values: any[] = context.getArguments()?.get('values') ?? [];
		const stream = context.getArguments()?.get('stream');
		const line = values
			.map(v => (typeof v === 'string' ? v : JSON.stringify(toPlain(v))))
			.join(' ');
		this.lines.push(stream === 'ERROR' ? `[error] ${line}` : line);
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}
}

class PrintRepository implements Repository<Function> {
	constructor(private readonly print: CapturedPrint) {}

	find(namespace: string, name: string): Promise<Function | undefined> {
		return Promise.resolve(
			namespace === Namespaces.SYSTEM && name === 'Print' ? this.print : undefined,
		);
	}

	filter(): Promise<string[]> {
		return Promise.resolve([]);
	}
}

const BUILT_INS = new KIRunFunctionRepository();
const SCHEMAS = new KIRunSchemaRepository();

let runCounter = 0;

/** The repositories a sandboxed run sees: the KIRun built-ins, with Print captured. */
export function sandboxRepositories(lines: string[]): {
	functions: Repository<Function>;
	schemas: KIRunSchemaRepository;
} {
	return {
		functions: new HybridRepository<Function>(
			new PrintRepository(new CapturedPrint(lines)),
			BUILT_INS,
		),
		schemas: SCHEMAS,
	};
}

/** Steps grouped by graph level: a step's level is one more than the deepest step it waits on. */
export function planLevels(graph: ExecutionGraph<string, StatementExecution>): string[][] {
	const nodes = graph.getNodeMap();
	const level = new Map<string, number>();
	const visiting = new Set<string>();
	const levelOf = (key: string): number => {
		if (level.has(key)) return level.get(key)!;
		if (visiting.has(key)) return 0;
		visiting.add(key);
		let l = 0;
		for (const tuple of Array.from(nodes.get(key)?.getInVertices() ?? [])) {
			const from = tuple.getT1().getKey();
			l = Math.max(l, levelOf(from) + 1);
		}
		visiting.delete(key);
		level.set(key, l);
		return l;
	};
	const levels: string[][] = [];
	for (const key of Array.from(nodes.keys())) {
		const l = levelOf(key);
		(levels[l] ??= []).push(key);
	}
	return levels.filter(Boolean).map(l => l.sort());
}

const COLUMN = 400;
// A step's height in the graph: its header, one row per parameter it shows (with the value under
// the name, as the editor's Show Expressions draws it), and the trace's footer line, plus a gap.
// Stacking at a fixed pitch put one step over the next once values and the trace were shown.
const STEP_HEAD = 170;
const STEP_PARAM = 72;
const STEP_FOOT = 44;
const STEP_GAP = 56;

export function stepHeight(step: any): number {
	const params = Object.keys(step?.parameterMap ?? {}).length;
	return STEP_HEAD + STEP_PARAM * Math.max(1, params) + STEP_FOOT;
}

const hasPosition = (step: any) => !!(step?.position?.left || step?.position?.top);

/**
 * Gives steps without a position one: a column per execution-plan level, stacked inside it.
 * Text compiled from the DSL carries no positions, and the graph would otherwise draw every step
 * on top of the first. Steps that already have a position keep it.
 */
export async function layoutDefinition(definition: any): Promise<any> {
	const steps = definition?.steps;
	if (!steps || typeof steps !== 'object') return definition;
	if (Object.values(steps).every(hasPosition)) return definition;

	let levels: string[][];
	try {
		const runtime = new KIRuntime(FunctionDefinition.from(definition), false);
		levels = planLevels(await runtime.getExecutionPlan(BUILT_INS, SCHEMAS));
	} catch {
		levels = [];
	}
	const placed = new Set(levels.flat());
	const rest = Object.keys(steps).filter(k => !placed.has(k));
	if (rest.length) levels.push(rest);

	const out = { ...definition, steps: { ...steps } };
	levels.forEach((level, column) => {
		let top = 40;
		level.forEach(name => {
			const step = out.steps[name];
			if (!step || hasPosition(step)) return;
			out.steps[name] = { ...step, position: { left: 40 + column * COLUMN, top } };
			top += stepHeight(step) + STEP_GAP;
		});
	});
	return out;
}

function failedStep(entries: LogEntry[]): string | undefined {
	for (let i = entries.length - 1; i >= 0; i--) {
		const nested = failedStep(entries[i].children ?? []);
		if (nested) return nested;
		if (entries[i].error) return entries[i].statementName;
	}
	return undefined;
}

/** Arguments as an object, or as JSON text from a plain text box ("" and blank mean none). */
export function parseArguments(args: any): Map<string, any> {
	let value = args;
	if (typeof args === 'string') {
		if (!args.trim()) return new Map();
		try {
			value = JSON.parse(args);
		} catch (err) {
			throw new Error(`Arguments are not valid JSON: ${errorMessage(err)}`);
		}
	}
	if (value === null || value === undefined) return new Map();
	if (typeof value !== 'object' || Array.isArray(value))
		throw new Error('Arguments must be a JSON object, like {"a": 2}');
	return new Map(Object.entries(value));
}

export async function runDefinition(
	definition: any,
	args: Record<string, any> | string = {},
	debug = true,
): Promise<{
	events: Array<{ name: string; result: any }>;
	console: string[];
	log: any[];
	plan: string[][];
	error: { message: string; step?: string } | null;
	ms: number;
}> {
	const lines: string[] = [];
	const { functions, schemas } = sandboxRepositories(lines);
	const executionId = `playground_${Date.now().toString(36)}_${++runCounter}`;
	const collector = DebugCollector.getInstance();
	const wasEnabled = collector.isEnabled();
	const started = performance.now();
	const events: Array<{ name: string; result: any }> = [];
	let plan: string[][] = [];
	let error: { message: string; step?: string } | null = null;

	try {
		if (!definition || typeof definition !== 'object')
			throw new Error('No function definition to run');
		const argMap = parseArguments(args);
		const runtime = new KIRuntime(FunctionDefinition.from(definition), debug);
		try {
			plan = planLevels(await runtime.getExecutionPlan(functions, schemas));
		} catch {
			// A plan that cannot be built is reported by the run itself.
		}
		const fep = new FunctionExecutionParameters(functions, schemas, executionId).setArguments(
			argMap,
		);
		const output = await runtime.execute(fep);
		for (let ev = output.next(); ev; ev = output.next())
			events.push({ name: ev.getName(), result: toPlain(ev.getResult()) });
	} catch (err) {
		error = { message: errorMessage(err) };
	} finally {
		if (debug && !wasEnabled) collector.disable();
	}

	const ms = Math.round((performance.now() - started) * 100) / 100;
	const execution = debug ? collector.getExecution(executionId) : undefined;
	const log = toPlain(execution?.logs ?? []);
	if (error && execution) error.step = failedStep(execution.logs);
	return { events, console: lines, log, plan, error, ms };
}

export class RunKIRun extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const a = context.getArguments();
		const result = await runDefinition(
			a?.get('definition'),
			a?.get('arguments'),
			a?.get('debug') !== false,
		);
		return new FunctionOutput([EventResult.outputOf(withResult(result))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
