import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

/**
 * ADZ-1461: an expression's `.length` counts UTF-16 units, so an emoji counts 2. Meta and Google count characters
 * (code points), as a person does. This counts the characters of each text given, trimmed when asked.
 */
function characterCount(value: any, trim: boolean): number {
	if (value === undefined || value === null) return 0;
	const s = typeof value === 'string' ? value : String(value);
	return Array.from(trim ? s.trim() : s).length;
}

const SIGNATURE = new FunctionSignature('CharacterCount')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('values', Schema.ofArray('values', Schema.ofAny('value'))),
			Parameter.ofEntry('trim', Schema.ofBoolean('trim').setDefaultValue(false)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['counts', Schema.ofArray('counts', Schema.ofInteger('count'))]]),
			),
		]),
	)
	.setDescription('Counts the characters of each text, an emoji as one')
	.setDocumentation(
		"# UIEngine.CharacterCount\n\nCounts the characters (Unicode code points) of each text in `values`, so an emoji or another character outside the basic plane counts as one, as Meta and Google count it. An expression's `.length` counts UTF-16 units instead (an emoji is 2).\n\n## Parameters\n\n- **values** (Array): the texts; a missing value counts 0, a non-text is counted as its text form\n- **trim** (Boolean, default false): count each text without its leading and trailing spaces\n\n## Events\n\n- **output**\n  - `counts` (Array of Integer): one count per value, in order",
	);

export class CharacterCount extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const values: any[] = context.getArguments()?.get('values') ?? [];
		const trim = !!context.getArguments()?.get('trim');
		const counts = (Array.isArray(values) ? values : []).map(v => characterCount(v, trim));
		return new FunctionOutput([EventResult.outputOf(new Map([['counts', counts]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
