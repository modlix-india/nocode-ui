import {
	Event,
	FunctionExecutionParameters,
	FunctionOutput,
	KIRunFunctionRepository,
	KIRunSchemaRepository,
} from '@fincity/kirun-js';
import type { SoftphoneFacade } from '../../../softphone/types';

/**
 * The seven calling functions, driven through `execute` rather than `internalExecute`.
 *
 * That is the entry point KIRuntime uses, so it also exercises schema validation and the parameter
 * defaults - the latter matters here because `MakeCall` leans on an empty `connectionName`
 * meaning "whatever the component is configured with".
 */

const facade: jest.Mocked<SoftphoneFacade> = {
	answer: jest.fn(),
	hangup: jest.fn(),
	toggleHold: jest.fn(),
	toggleMute: jest.fn(),
	sendDtmf: jest.fn(),
	dial: jest.fn(),
	setAvailability: jest.fn(),
};

let currentPhone: SoftphoneFacade | undefined = facade;

jest.mock('../../../softphone/registry', () => ({
	softphoneRegistry: { current: () => currentPhone },
}));

import { AnswerCall } from '../AnswerCall';
import { HangupCall } from '../HangupCall';
import { MakeCall } from '../MakeCall';
import { SendDTMF } from '../SendDTMF';
import { SetSoftphoneAvailability } from '../SetSoftphoneAvailability';
import { ToggleHold } from '../ToggleHold';
import { ToggleMute } from '../ToggleMute';

const functionRepository = new KIRunFunctionRepository();
const schemaRepository = new KIRunSchemaRepository();

function params(args: Record<string, unknown> = {}): FunctionExecutionParameters {
	return new FunctionExecutionParameters(functionRepository, schemaRepository).setArguments(
		new Map(Object.entries(args)),
	);
}

function eventNames(output: FunctionOutput): string[] {
	return output.allResults().map(r => r.getName());
}

function resultOf(output: FunctionOutput): unknown {
	return output.allResults()[0].getResult().get('result');
}

function errorOf(output: FunctionOutput): { code: unknown; message: unknown } {
	const result = output.allResults()[0].getResult();
	return { code: result.get('code'), message: result.get('message') };
}

const ALL = [
	{ name: 'MakeCall', make: () => new MakeCall(), args: { ticketId: '501' } },
	{ name: 'AnswerCall', make: () => new AnswerCall(), args: {} },
	{ name: 'HangupCall', make: () => new HangupCall(), args: {} },
	{ name: 'ToggleHold', make: () => new ToggleHold(), args: {} },
	{ name: 'ToggleMute', make: () => new ToggleMute(), args: {} },
	{ name: 'SendDTMF', make: () => new SendDTMF(), args: { digit: '5' } },
	{
		name: 'SetSoftphoneAvailability',
		make: () => new SetSoftphoneAvailability(),
		args: { available: false },
	},
];

describe('calling function signatures', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentPhone = facade;
	});

	it.each(ALL)('$name is registered under UIEngine with a matching name', ({ name, make }) => {
		const signature = make().getSignature();

		// The class is registered in the function map under its *export* name, and looked up by
		// the signature's name. A mismatch makes the function silently unresolvable from a page,
		// with no build error anywhere.
		expect(signature.getName()).toBe(name);
		expect(signature.getFullName()).toBe(`UIEngine.${name}`);
	});

	it.each(ALL)('$name documents itself for the editor and the agent', ({ make }) => {
		const signature = make().getSignature();

		// Both feed registerFunctionDocumentation, which is what puts these in the KIRun editor's
		// autocomplete and surfaces them to the AI agent. An undocumented function is one nobody
		// building a page will find.
		expect(signature.getDescription()).toBeTruthy();
		expect(signature.getDocumentation()).toContain(`# UIEngine.${signature.getName()}`);
	});

	it.each(ALL)('$name reports both an output and an error branch', ({ make }) => {
		const events = make().getSignature().getEvents();
		expect(events.has(Event.OUTPUT)).toBe(true);
		expect(events.has(Event.ERROR)).toBe(true);
	});
});

describe('calling functions with no phone available', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentPhone = undefined;
	});

	it.each(ALL)('$name says so rather than failing silently', async ({ make, args }) => {
		const output = await make().execute(params(args));

		// Only the error branch. A control that did nothing must not also run the success path -
		// a page that dials and then opens a call window should not open one for a call that was
		// never placed.
		expect(eventNames(output)).toEqual([Event.ERROR]);
		expect(errorOf(output)).toEqual({
			code: 'NOT_PROVISIONED',
			message: 'Calling is not available for this user on this page.',
		});
	});
});

describe('MakeCall', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentPhone = facade;
	});

	it('dials a deal and returns the call record', async () => {
		facade.dial.mockResolvedValue({ code: 'abc123', callStatus: 'ORIGINATE' });

		const output = await new MakeCall().execute(
			params({ ticketId: '501', connectionName: 'exotelConnection' }),
		);

		expect(facade.dial).toHaveBeenCalledWith('501', 'exotelConnection');
		expect(eventNames(output)).toEqual([Event.OUTPUT]);
		expect(resultOf(output)).toEqual({ code: 'abc123', callStatus: 'ORIGINATE' });
	});

	it('falls back to the connection the component is configured with', async () => {
		facade.dial.mockResolvedValue({});

		await new MakeCall().execute(params({ ticketId: '501' }));

		// The parameter defaults to an empty string, which must reach the registry as "unset"
		// rather than as a connection named "".
		expect(facade.dial).toHaveBeenCalledWith('501', undefined);
	});

	it('reports why a dial was refused, with a code a page can branch on', async () => {
		facade.dial.mockRejectedValue({
			code: 'DIAL_REJECTED',
			message: 'This deal has no phone number.',
		});

		const output = await new MakeCall().execute(params({ ticketId: '501' }));

		expect(eventNames(output)).toEqual([Event.ERROR]);
		expect(errorOf(output)).toEqual({
			code: 'DIAL_REJECTED',
			message: 'This deal has no phone number.',
		});
	});

	it('turns an ordinary thrown error into a reportable one', async () => {
		facade.dial.mockRejectedValue(new Error('Network is down.'));

		const output = await new MakeCall().execute(params({ ticketId: '501' }));

		expect(errorOf(output)).toEqual({
			code: 'NO_ACTIVE_CALL',
			message: 'Network is down.',
		});
	});
});

describe('call controls', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentPhone = facade;
	});

	it('answers and hangs up', async () => {
		facade.answer.mockResolvedValue(true);
		facade.hangup.mockResolvedValue(true);

		expect(resultOf(await new AnswerCall().execute(params()))).toBe(true);
		expect(resultOf(await new HangupCall().execute(params()))).toBe(true);
		expect(facade.answer).toHaveBeenCalledTimes(1);
		expect(facade.hangup).toHaveBeenCalledTimes(1);
	});

	it('returns the state a toggle landed on, not just that it ran', async () => {
		facade.toggleHold.mockResolvedValue(true);
		facade.toggleMute.mockResolvedValue(false);

		// The page binds a button's label to this, so "it worked" is not enough - it has to say
		// which way it went.
		expect(resultOf(await new ToggleHold().execute(params()))).toBe(true);
		expect(resultOf(await new ToggleMute().execute(params()))).toBe(false);
	});

	it('reports a mute with no call in progress instead of pretending', async () => {
		facade.toggleMute.mockRejectedValue({
			code: 'NO_ACTIVE_CALL',
			message: 'There is no call in progress.',
		});

		const output = await new ToggleMute().execute(params());

		expect(eventNames(output)).toEqual([Event.ERROR]);
		expect(errorOf(output).code).toBe('NO_ACTIVE_CALL');
	});

	it('sends one keypad tone', async () => {
		facade.sendDtmf.mockResolvedValue(true);

		await new SendDTMF().execute(params({ digit: '#' }));

		expect(facade.sendDtmf).toHaveBeenCalledWith('#');
	});
});

describe('SetSoftphoneAvailability', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentPhone = facade;
	});

	it('goes offline when asked', async () => {
		facade.setAvailability.mockResolvedValue(false);

		await new SetSoftphoneAvailability().execute(params({ available: false }));

		expect(facade.setAvailability).toHaveBeenCalledWith(false);
	});

	it('goes online by default, so the common case needs no parameter', async () => {
		facade.setAvailability.mockResolvedValue(true);

		await new SetSoftphoneAvailability().execute(params());

		expect(facade.setAvailability).toHaveBeenCalledWith(true);
	});
});
