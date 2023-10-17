import {
    AbstractFunction,
    Event,
    EventResult,
    FunctionExecutionParameters,
    FunctionOutput,
    FunctionSignature,
    isNullValue,
    Parameter,
    Schema,
} from '@fincity/kirun-js';
import axios from 'axios';
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE, STORE_PREFIX } from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('CopyToClipboard')
    .setNamespace(NAMESPACE_UI_ENGINE)
    .setParameters(
        new Map([
            Parameter.ofEntry('text', Schema.ofString('text')),
        ]),
    )
    .setEvents(
        new Map([
            Event.eventMapEntry(Event.OUTPUT, new Map()),
            Event.eventMapEntry(
                Event.ERROR,
                new Map([
                    ['data', Schema.ofAny('data')],
                ]),
            ),
        ]),
    );

export class CopyToClipboard extends AbstractFunction {
    protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
        const text: string = context.getArguments()?.get('text');
        try {
            await navigator.clipboard.writeText(text)
        } catch (error) {
            return new FunctionOutput([
                EventResult.of(
                    Event.ERROR,
                    new Map([
                        ['data', error],
                    ]),
                ),
                EventResult.outputOf(new Map([['data', null]])),
            ]);
        }
        return new FunctionOutput([EventResult.outputOf(new Map())]);
    }

    getSignature(): FunctionSignature {
        return SIGNATURE;
    }
}
