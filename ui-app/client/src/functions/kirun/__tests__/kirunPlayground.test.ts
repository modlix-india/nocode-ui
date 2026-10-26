import { evaluateExpression } from '../EvaluateExpression';
import { kirunText } from '../KIRunText';
import { layoutDefinition, runDefinition, stepHeight } from '../RunKIRun';
import { toPlain } from '../plain';

const ADD_NUMBERS = {
	name: 'AddNumbers',
	namespace: 'Playground',
	parameters: {
		a: { parameterName: 'a', schema: { type: 'INTEGER' } },
		b: { parameterName: 'b', schema: { type: 'INTEGER' } },
	},
	events: { output: { name: 'output', parameters: { result: { type: 'INTEGER' } } } },
	steps: {
		add: {
			statementName: 'add',
			namespace: 'System.Math',
			name: 'Add',
			parameterMap: {
				value: {
					x1: { key: 'x1', type: 'EXPRESSION', expression: 'Arguments.a', order: 1 },
					x2: { key: 'x2', type: 'EXPRESSION', expression: 'Arguments.b', order: 2 },
				},
			},
		},
		done: {
			statementName: 'done',
			namespace: 'System',
			name: 'GenerateEvent',
			parameterMap: {
				eventName: { e1: { key: 'e1', type: 'VALUE', value: 'output' } },
				results: {
					r1: {
						key: 'r1',
						type: 'VALUE',
						value: {
							name: 'result',
							value: { isExpression: true, value: 'Steps.add.output.value' },
						},
					},
				},
			},
		},
	},
};

const step = (
	statementName: string,
	namespace: string,
	name: string,
	parameterMap: any = {},
	extra: any = {},
) => ({
	statementName,
	namespace,
	name,
	parameterMap,
	...extra,
});
const value = (v: any) => ({ v: { key: 'v', type: 'VALUE', value: v } });
const expr = (e: string) => ({ e: { key: 'e', type: 'EXPRESSION', expression: e } });

describe('UIEngine.RunKIRun', () => {
	test('runs a definition and returns its events, trace and plan', async () => {
		const r = await runDefinition(ADD_NUMBERS, { a: 2, b: 3 });
		expect(r.error).toBeNull();
		expect(r.events).toEqual([{ name: 'output', result: { result: 5 } }]);
		expect(r.plan).toEqual([['add'], ['done']]);
		expect(r.log.map((e: any) => e.statementName)).toEqual(
			expect.arrayContaining(['add', 'done']),
		);
		const add = r.log.find((e: any) => e.statementName === 'add');
		expect(add.result).toEqual({ value: 5 });
		expect(typeof r.ms).toBe('number');
	});

	test('System.Print goes to the console buffer, not the browser console', async () => {
		const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
		const r = await runDefinition({
			name: 'Hello',
			namespace: 'Playground',
			steps: {
				p: step('p', 'System', 'Print', {
					values: {
						a: { key: 'a', type: 'VALUE', value: 'hello', order: 1 },
						b: { key: 'b', type: 'VALUE', value: { n: 1 }, order: 2 },
					},
				}),
			},
		});
		expect(r.error).toBeNull();
		expect(r.console).toEqual(['hello {"n":1}']);
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('is sandboxed: UIEngine and server functions are not reachable', async () => {
		const r = await runDefinition({
			name: 'Sneaky',
			namespace: 'Playground',
			steps: { send: step('send', 'UIEngine', 'SendData', { url: value('/api/x') }) },
		});
		expect(r.error).not.toBeNull();
		expect(r.error!.message).toMatch(/UIEngine\.SendData/);
		expect(r.events).toEqual([]);
	});

	test('steps with no dependency between them share a plan level', async () => {
		const r = await runDefinition({
			name: 'Parallel',
			namespace: 'Playground',
			events: { output: { name: 'output', parameters: { sum: { type: 'INTEGER' } } } },
			steps: {
				left: step('left', 'System.Math', 'Add', {
					value: {
						a: { key: 'a', type: 'VALUE', value: 1, order: 1 },
						b: { key: 'b', type: 'VALUE', value: 2, order: 2 },
					},
				}),
				right: step('right', 'System.Math', 'Add', {
					value: {
						a: { key: 'a', type: 'VALUE', value: 3, order: 1 },
						b: { key: 'b', type: 'VALUE', value: 4, order: 2 },
					},
				}),
				done: step('done', 'System', 'GenerateEvent', {
					eventName: value('output'),
					results: value({
						name: 'sum',
						value: {
							isExpression: true,
							value: 'Steps.left.output.value + Steps.right.output.value',
						},
					}),
				}),
			},
		});
		expect(r.error).toBeNull();
		expect(r.plan).toEqual([['left', 'right'], ['done']]);
		expect(r.events[0].result).toEqual({ sum: 10 });
	});

	test('a loop runs its branch once per iteration and Break stops it', async () => {
		const r = await runDefinition({
			name: 'LoopBreak',
			namespace: 'Playground',
			steps: {
				loop: step('loop', 'System.Loop', 'RangeLoop', { from: value(0), to: value(10) }),
				say: step(
					'say',
					'System',
					'Print',
					{ values: expr('Steps.loop.iteration.index') },
					{ dependentStatements: { 'Steps.loop.iteration': true } },
				),
				check: step(
					'check',
					'System',
					'If',
					{ condition: expr('Steps.loop.iteration.index = 2') },
					{ dependentStatements: { 'Steps.say.output': true } },
				),
				stop: step(
					'stop',
					'System.Loop',
					'Break',
					{ stepName: value('loop') },
					{ dependentStatements: { 'Steps.check.true': true } },
				),
			},
		});
		expect(r.error).toBeNull();
		expect(r.console).toEqual(['0', '1', '2']);
	});

	test('a failing run reports the message and the step', async () => {
		const r = await runDefinition(
			{
				name: 'Bad',
				namespace: 'Playground',
				parameters: { n: { parameterName: 'n', schema: { type: 'INTEGER' } } },
				steps: {
					add: step('add', 'System.Math', 'Add', {
						value: {
							a: {
								key: 'a',
								type: 'EXPRESSION',
								expression: 'Arguments.n',
								order: 1,
							},
						},
					}),
				},
			},
			{ n: 'not a number' },
		);
		expect(r.error).not.toBeNull();
		expect(r.error!.message.length).toBeGreaterThan(0);
	});

	test('arguments may be JSON text, and bad text is a clear error', async () => {
		const ok = await runDefinition(ADD_NUMBERS, '{"a": 1, "b": 41}');
		expect(ok.events).toEqual([{ name: 'output', result: { result: 42 } }]);
		const bad = await runDefinition(ADD_NUMBERS, '{a: 1');
		expect(bad.error?.message).toMatch(/^Arguments are not valid JSON/);
		const arr = await runDefinition(ADD_NUMBERS, '[1, 2]');
		expect(arr.error?.message).toMatch(/must be a JSON object/);
	});

	test('nothing to run is an error, not a throw', async () => {
		const r = await runDefinition(undefined);
		expect(r.error?.message).toBe('No function definition to run');
	});
});

describe('UIEngine.KIRunText', () => {
	test('decompiles a definition to text and compiles it back', async () => {
		const text = await kirunText('decompile', undefined, ADD_NUMBERS);
		expect(text.valid).toBe(true);
		expect(text.text).toContain('FUNCTION AddNumbers');
		expect(text.text).toContain('System.Math.Add');

		const back = await kirunText('compile', text.text!, undefined);
		expect(back.valid).toBe(true);
		expect(Object.keys(back.definition.steps).sort()).toEqual(['add', 'done']);
		const r = await runDefinition(back.definition, { a: 4, b: 5 });
		expect(r.events).toEqual([{ name: 'output', result: { result: 9 } }]);
	});

	test('compiled steps get positions laid out by plan level', async () => {
		const text = (await kirunText('decompile', undefined, ADD_NUMBERS)).text!;
		const { definition } = await kirunText('compile', text, undefined);
		const add = definition.steps.add.position;
		const done = definition.steps.done.position;
		expect(add).toBeTruthy();
		expect(done.left).toBeGreaterThan(add.left);
	});

	test('steps in one plan level are stacked without overlapping', async () => {
		const text = `FUNCTION Four
    LOGIC
        a: System.Context.Create(name = "a", schema = {type: "INTEGER"})
        b: System.Context.Create(name = "b", schema = {type: "INTEGER"})
        c: System.Math.Add(value = 1, value = 2)
        d: System.Wait(millis = 1)`;
		const { definition } = await kirunText('compile', text, undefined);
		const steps = Object.values<any>(definition.steps).sort((x, y) => x.position.top - y.position.top);
		expect(new Set(steps.map(s => s.position.left)).size).toBe(1);
		for (let i = 1; i < steps.length; i++)
			expect(steps[i].position.top).toBeGreaterThanOrEqual(
				steps[i - 1].position.top + stepHeight(steps[i - 1]),
			);
	});

	test('layout keeps positions that are already there', async () => {
		const withPos = {
			...ADD_NUMBERS,
			steps: {
				...ADD_NUMBERS.steps,
				add: { ...ADD_NUMBERS.steps.add, position: { left: 900, top: 900 } },
			},
		};
		const out = await layoutDefinition(withPos);
		expect(out.steps.add.position).toEqual({ left: 900, top: 900 });
		expect(out.steps.done.position).toBeTruthy();
	});

	test('reports problems with a line and column', async () => {
		const bad = 'FUNCTION Broken\n    LOGIC\n        x: System.Math.Add(value = \n';
		const v = await kirunText('validate', bad, undefined);
		expect(v.valid).toBe(false);
		expect(v.errors.length).toBeGreaterThan(0);
		expect(v.errors[0].message.length).toBeGreaterThan(0);

		const c = await kirunText('compile', bad, undefined);
		expect(c.valid).toBe(false);
		expect(c.definition).toBeNull();
		expect(c.errors.length).toBeGreaterThan(0);
	});

	test('json shows any value as indented text', async () => {
		const j = await kirunText('json', undefined, { a: [1, { b: 2 }] });
		expect(j.text).toBe('{\n  "a": [\n    1,\n    {\n      "b": 2\n    }\n  ]\n}');
	});

	test('formats text', async () => {
		const text = (await kirunText('decompile', undefined, ADD_NUMBERS)).text!;
		const f = await kirunText('format', text, undefined);
		expect(f.valid).toBe(true);
		expect(f.text).toContain('FUNCTION AddNumbers');
	});
});

describe('UIEngine.EvaluateExpression', () => {
	test('evaluates against Arguments, Steps and Context', () => {
		const r = evaluateExpression(
			'Arguments.a + Steps.add.output.value * Context.k',
			{ a: 1 },
			{ add: { output: { value: 5 } } },
			{ k: 2 },
		);
		expect(r).toMatchObject({ value: 11, type: 'number', error: null });
		expect(r.parsed).toBeTruthy();
	});

	test('the parsed form shows which operator binds first', () => {
		const r = evaluateExpression('1 + 2 * 3', {}, {}, {});
		expect(r.value).toBe(7);
		expect(r.parsed).toMatch(/\(/);
	});

	test('paths, comparison and ternary', () => {
		expect(evaluateExpression('Arguments.list[1]', { list: [10, 20] }, {}, {}).value).toBe(20);
		expect(evaluateExpression('Arguments.a = 3', { a: 3 }, {}, {}).value).toBe(true);
		expect(
			evaluateExpression("Arguments.a > 2 ? 'big' : 'small'", { a: 3 }, {}, {}).value,
		).toBe('big');
	});

	test('an empty expression is an error, not a throw', () => {
		expect(evaluateExpression('  ', {}, {}, {}).error).toBe('Type an expression');
	});
});

describe('toPlain', () => {
	test('maps, sets, cycles and functions', () => {
		const a: any = { m: new Map([['x', new Set([1, 2])]]), f: () => 1 };
		a.self = a;
		expect(toPlain(a)).toEqual({ m: { x: [1, 2] }, self: '[Circular]' });
	});
});
