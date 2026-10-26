import {
	AbstractFunction,
	DSLCompiler,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { errorMessage, toPlain, withResult } from './plain';
import { layoutDefinition } from './RunKIRun';

export type KIRunTextOp = 'compile' | 'decompile' | 'validate' | 'format' | 'json';
export type KIRunTextError = { line: number | null; col: number | null; message: string };

const SIGNATURE = new FunctionSignature('KIRunText')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry(
				'op',
				Schema.ofString('op')
					.setEnums(['compile', 'decompile', 'validate', 'format', 'json'])
					.setDefaultValue('compile'),
			),
			Parameter.ofEntry('text', Schema.ofString('text').setDefaultValue('')),
			Parameter.ofEntry('definition', Schema.ofAny('definition')),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['valid', Schema.ofBoolean('valid')],
					['text', Schema.ofAny('text')],
					['definition', Schema.ofAny('definition')],
					['errors', Schema.ofArray('errors', Schema.ofAny('error'))],
					['result', Schema.ofAny('result')],
				]),
			),
		]),
	)
	.setDescription(
		'Converts between KIRun DSL text and the function definition JSON, validates DSL text, or formats it',
	)
	.setDocumentation(
		'# UIEngine.KIRunText\n\nWorks with the KIRun text language (the DSL) in the browser.\n\n## Parameters\n\n- **op** (String): `compile` (text to definition, the default), `decompile` (definition to text), `validate` (check text), `format` (reformat text) or `json` (any value in `definition` as indented JSON text, for showing it)\n- **text** (String): the DSL text, for `compile`, `validate` and `format`\n- **definition** (Object): the function definition JSON, for `decompile`; any value, for `json`\n\n## Events\n\n- **output**, always raised:\n  - `valid` (Boolean): false when the text or definition could not be read\n  - `text` (String or null): the DSL text (`decompile`, `format`)\n  - `definition` (Object or null): the definition JSON (`compile`); steps the text gives no position are laid out in columns by execution-plan level, so the graph view is readable\n  - `errors` (Array): `{line, col, message}` for each problem; `line` and `col` are 1-based, or null when the problem has no position\n  - `result` (Object): all of the above as one plain object, for `SetStore` (`Steps.<step>.output` itself is a Map and does not store as JSON)',
	);

function validationErrors(text: string): KIRunTextError[] {
	try {
		const result = DSLCompiler.validate(text);
		return result.errors.map(e => ({
			line: e.line ?? null,
			col: e.column ?? null,
			message: e.message,
		}));
	} catch (err) {
		return [{ line: null, col: null, message: errorMessage(err) }];
	}
}

export async function kirunText(
	op: KIRunTextOp,
	text: string | undefined,
	definition: any,
): Promise<{ valid: boolean; text: string | null; definition: any; errors: KIRunTextError[] }> {
	const source = text ?? '';
	try {
		switch (op) {
			case 'validate': {
				const errors = validationErrors(source);
				return { valid: errors.length === 0, text: null, definition: null, errors };
			}
			case 'json':
				return {
					valid: true,
					text:
						definition === undefined
							? ''
							: JSON.stringify(toPlain(definition), null, 2),
					definition: null,
					errors: [],
				};
			case 'format':
				return {
					valid: true,
					text: await DSLCompiler.format(source),
					definition: null,
					errors: [],
				};
			case 'decompile':
				if (!definition || typeof definition !== 'object')
					return {
						valid: false,
						text: null,
						definition: null,
						errors: [
							{ line: null, col: null, message: 'No function definition to convert' },
						],
					};
				return {
					valid: true,
					text: await DSLCompiler.decompile(definition),
					definition: null,
					errors: [],
				};
			case 'compile':
			default:
				return {
					valid: true,
					text: null,
					definition: await layoutDefinition(DSLCompiler.compile(source)),
					errors: [],
				};
		}
	} catch (err) {
		// Compile and format throw on the first problem; validate reports them with positions.
		const errors = op === 'decompile' ? [] : validationErrors(source);
		return {
			valid: false,
			text: null,
			definition: null,
			errors: errors.length
				? errors
				: [{ line: null, col: null, message: errorMessage(err) }],
		};
	}
}

export class KIRunText extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const a = context.getArguments();
		const result = await kirunText(
			a?.get('op') ?? 'compile',
			a?.get('text'),
			a?.get('definition'),
		);
		return new FunctionOutput([EventResult.outputOf(withResult(result))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
