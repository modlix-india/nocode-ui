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
    .setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

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
