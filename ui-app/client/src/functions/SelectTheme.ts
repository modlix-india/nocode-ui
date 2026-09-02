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
import { selectTheme } from '../util/selectTheme';

const SIGNATURE = new FunctionSignature('SelectTheme')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('theme', Schema.ofString('theme'))]))
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['theme', Schema.ofString('theme')]])),
			Event.eventMapEntry(Event.ERROR, new Map([['data', Schema.ofAny('data')]])),
		]),
	)
	.setDescription("Applies one of the application's themes and remembers the choice")
	.setDocumentation(
		'# UIEngine.SelectTheme\n\n' +
			"Switches the application to one of the themes listed in the app definition's " +
			'`themes`, and remembers the choice so it survives a reload.\n\n' +
			'The theme is applied atomically: its stylesheet is loaded to completion before ' +
			'the theme variables change, so the page never renders one theme against ' +
			"another's CSS.\n\n" +
			'## Parameters\n\n' +
			'- **theme** (String, required): the theme document name, as it appears in ' +
			'`Store.application.properties.themes.<key>.name`\n\n' +
			'## Events\n\n' +
			'- **output**: the theme that was actually applied\n' +
			'  - `theme` (String): the resolved name. This is not always the name that was ' +
			"asked for — a name that is not in the app's list falls back to the default " +
			'theme rather than failing.\n' +
			'- **error**: the app has no themes at all, or the switch could not be applied\n' +
			'  - `data` (Any): error details\n\n' +
			'## Where the choice is kept\n\n' +
			'A first-party cookie on this device, and for a signed-in user also the ' +
			'personalization service, which is what carries the choice to another device. ' +
			'Both are written for you.\n\n' +
			'## Reading the current state\n\n' +
			'- `Store.selectedTheme` — the active theme name\n' +
			'- `Store.application.properties.themes` — the themes to offer, each with an ' +
			'optional `displayName`, `icon` and `iconColor`\n\n' +
			'## Use Cases\n\n' +
			'- **Dark mode toggle**: switch between a light and a dark theme\n' +
			'- **Theme picker**: let the user choose from several brand appearances\n' +
			'- **Accessibility**: offer a high-contrast theme',
	);

export class SelectTheme extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const theme: string = context.getArguments()?.get('theme');

		try {
			const resolved = await selectTheme(theme);

			if (!resolved)
				return new FunctionOutput([
					EventResult.of(
						Event.ERROR,
						new Map<string, any>([
							['data', `No theme to select: the application defines none.`],
						]),
					),
				]);

			return new FunctionOutput([
				EventResult.outputOf(new Map<string, any>([['theme', resolved]])),
			]);
		} catch (error) {
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map<string, any>([['data', error]])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
