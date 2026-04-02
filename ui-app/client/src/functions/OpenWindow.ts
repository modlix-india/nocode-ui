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

const SIGNATURE = new FunctionSignature('OpenWindow')
    .setNamespace(NAMESPACE_UI_ENGINE)
    .setParameters(
        new Map([
            Parameter.ofEntry('url', Schema.ofString('url')),
            Parameter.ofEntry('target', Schema.ofString('target').setDefaultValue('_blank')),
            Parameter.ofEntry('features', Schema.ofString('features').setDefaultValue('')),
            Parameter.ofEntry('popup', Schema.ofBoolean('popup').setDefaultValue(false)),
        ]),
    )
    .setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
    .setDescription('Opens a URL in a new browser window or tab with configurable features')
    .setDocumentation('# UIEngine.OpenWindow\n\nOpens a URL in a new browser window or tab using `window.open()`. Supports configuring the target, window features (size, position, etc.), and popup mode.\n\n## Parameters\n\n- **url** (String, required): The URL to open\n- **target** (String, optional, default: \'_blank\'): Window target (`_blank`, `_self`, `_parent`, `_top`, or a named window)\n- **features** (String, optional, default: \'\'): Window features string (e.g., `width=800,height=600,scrollbars=yes`)\n- **popup** (Boolean, optional, default: false): If true, adds `popup=yes` to the window features\n\n## Events\n\n- **output**: Triggered after the window is opened\n\n## Use Cases\n\n- **External Links**: Open external websites in new tabs\n- **Preview Windows**: Open preview or print views in popup windows\n- **OAuth Flows**: Open authentication popups for third-party login\n- **Documentation**: Open help or documentation pages in new tabs\n- **Reports**: Open generated reports in separate windows');

export class OpenWindow extends AbstractFunction {
    protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
        const args = context.getArguments();
        const linkPath: string = args?.get('url');
        const target: string = args?.get('target') ?? '_blank';
        const featuresArg: string = args?.get('features') ?? '';
        const popup: boolean = args?.get('popup') ?? false;

        const url = getHref(linkPath, window.location);

        const features: string[] = featuresArg ? [featuresArg] : [];
        if (popup) features.push('popup=yes');

        const featuresStr = features.length > 0 ? features.join(',') : undefined;

        window.open(url, target, featuresStr);

        return new FunctionOutput([EventResult.outputOf(new Map())]);
    }

    getSignature(): FunctionSignature {
        return SIGNATURE;
    }
}
