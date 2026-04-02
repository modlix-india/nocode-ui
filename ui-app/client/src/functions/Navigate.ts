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
import { getHref } from '../components/util/getHref';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('Navigate')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('linkPath', Schema.ofString('linkPath')),
			Parameter.ofEntry('target', Schema.ofString('target').setDefaultValue('_self')),
			Parameter.ofEntry('force', Schema.ofBoolean('force').setDefaultValue(false)),
			Parameter.ofEntry('removeThisPageFromHistory', Schema.ofBoolean('removeThisPageFromHistory').setDefaultValue(false)),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Navigates to a specified URL or page path within the application')
	.setDocumentation('# UIEngine.Navigate\n\nNavigates to a specified URL or internal page path. For internal links with `_self` target, uses the History API for seamless SPA navigation. For external links or other targets, uses `window.open`. Supports removing the current page from browser history.\n\n## Parameters\n\n- **linkPath** (String, required): The URL or page path to navigate to\n- **target** (String, optional, default: \'_self\'): Window target (`_self`, `_blank`, `_parent`, `_top`)\n- **force** (Boolean, optional, default: false): If true, forces a full navigation even for internal links\n- **removeThisPageFromHistory** (Boolean, optional, default: false): If true, replaces the current history entry instead of pushing a new one\n\n## Events\n\n- **output**: Triggered after navigation is initiated\n\n## Use Cases\n\n- **Page Navigation**: Move between pages in the application\n- **External Links**: Open external URLs in new tabs\n- **Post-Login Redirect**: Navigate to a target page after authentication\n- **Wizard Flows**: Navigate between steps, optionally preventing back navigation\n- **Deep Linking**: Navigate to specific pages with parameters');

export class Navigate extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const linkPath: string = context.getArguments()?.get('linkPath');
		const target = context.getArguments()?.get('target');
		const force = context.getArguments()?.get('force');
		const removeThisPageFromHistory = context.getArguments()?.get('removeThisPageFromHistory');
		const url = getHref(linkPath, window.location);

		if (target === '_self' && !force && !url?.startsWith("http")) {	
			if (removeThisPageFromHistory) {
				window.history.replaceState(undefined, '', url);
				window.history.back();
				setTimeout(() => window.history.forward(), 100);
			} else {
				window.history.pushState(undefined, '', url);
				window.history.back();
				setTimeout(() => window.history.forward(), 100);
			}
		} else window.open(url, target);

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
