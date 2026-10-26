import {
	AbstractFunction,
	ArgumentsTokenValueExtractor,
	ContextElement,
	ContextTokenValueExtractor,
	Event,
	EventResult,
	ExpressionEvaluator,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	OutputMapTokenValueExtractor,
	Parameter,
	Schema,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { errorMessage, toPlain, typeName, withResult } from './plain';

const SIGNATURE = new FunctionSignature('EvaluateExpression')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('expression', Schema.ofString('expression')),
			Parameter.ofEntry('arguments', Schema.ofAny('arguments').setDefaultValue({})),
			Parameter.ofEntry('steps', Schema.ofAny('steps').setDefaultValue({})),
			Parameter.ofEntry('context', Schema.ofAny('context').setDefaultValue({})),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['value', Schema.ofAny('value')],
					['type', Schema.ofString('type')],
					['parsed', Schema.ofAny('parsed')],
					['error', Schema.ofAny('error')],
					['result', Schema.ofAny('result')],
				]),
			),
		]),
	)
	.setDescription(
		'Evaluates one KIRun expression against sample Arguments, Steps and Context, and shows how it was parsed',
	)
	.setDocumentation(
		"# UIEngine.EvaluateExpression\n\nEvaluates a single KIRun expression in the browser, the way a step's parameter would, against values you supply. Only `Arguments.`, `Steps.` and `Context.` paths resolve; page and store paths do not.\n\n## Parameters\n\n- **expression** (String, required): for example `Arguments.a + Steps.add.output.value * 2`\n- **arguments** (Object): values for `Arguments.<name>`\n- **steps** (Object): step outputs as `{stepName: {eventName: {resultName: value}}}`, for `Steps.<step>.<event>.<result>`\n- **context** (Object): values for `Context.<name>`\n\n## Events\n\n- **output**, always raised:\n  - `value`: the result\n  - `type` (String): null, array, object, string, number or boolean\n  - `parsed` (String or null): the expression as parsed, with brackets showing which operator binds first\n  - `error` (String or null): why it could not be parsed or evaluated\n  - `result` (Object): all of the above as one plain object, for `SetStore` (`Steps.<step>.output` itself is a Map and does not store as JSON)",
	);

function toMap(o: any): Map<string, any> {
	return new Map(o && typeof o === 'object' && !Array.isArray(o) ? Object.entries(o) : []);
}

export function evaluateExpression(
	expression: string | undefined,
	args: any,
	steps: any,
	context: any,
): { value: any; type: string; parsed: string | null; error: string | null } {
	let parsed: string | null = null;
	try {
		if (!expression?.trim()) throw new Error('Type an expression');
		const evaluator = new ExpressionEvaluator(expression);
		parsed = evaluator.getExpression().toString();

		const stepMap = new Map<string, Map<string, Map<string, any>>>();
		for (const [step, eventsOfStep] of toMap(steps).entries()) {
			const events = new Map<string, Map<string, any>>();
			for (const [event, results] of toMap(eventsOfStep).entries())
				events.set(event, toMap(results));
			stepMap.set(step, events);
		}
		const contextMap = new Map<string, ContextElement>();
		for (const [name, value] of toMap(context).entries())
			contextMap.set(name, new ContextElement(Schema.ofAny(name), value));

		const extractors: TokenValueExtractor[] = [
			new ArgumentsTokenValueExtractor(toMap(args)),
			new OutputMapTokenValueExtractor(stepMap),
			new ContextTokenValueExtractor(contextMap),
		];
		const valuesMap = new Map(
			extractors.map(e => [e.getPrefix(), e] as [string, TokenValueExtractor]),
		);
		const value = toPlain(evaluator.evaluate(valuesMap));
		return { value: value ?? null, type: typeName(value), parsed, error: null };
	} catch (err) {
		return { value: null, type: 'null', parsed, error: errorMessage(err) };
	}
}

export class EvaluateExpression extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const a = context.getArguments();
		const result = evaluateExpression(
			a?.get('expression'),
			a?.get('arguments'),
			a?.get('steps'),
			a?.get('context'),
		);
		return new FunctionOutput([EventResult.outputOf(withResult(result))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
