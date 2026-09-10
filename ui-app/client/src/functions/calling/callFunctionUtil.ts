import { Event, EventResult, FunctionOutput } from '@fincity/kirun-js';
import { softphoneRegistry } from '../../softphone/registry';
import { SoftphoneError, SoftphoneFacade } from '../../softphone/types';

/**
 * The bit every calling function does identically: find the phone, run one control, and report
 * what happened in a way a page can branch on.
 *
 * A control that fails fires `error` and **not** `output`, unlike the data functions in this
 * folder which fire both. The difference is deliberate: a page that dials and then opens a call
 * window should not open one for a call that was refused, whereas a fetch that fails still has a
 * "carry on with nothing" branch worth taking.
 */
export async function runSoftphoneControl<T>(
	action: (phone: SoftphoneFacade) => Promise<T>,
): Promise<FunctionOutput> {
	const phone = softphoneRegistry.current();

	// Undefined rather than a dormant phone means calling is not set up for this user, or no
	// Softphone component is mounted on this page. Both are worth saying out loud - silence here
	// is what makes a dead Call button take an afternoon to diagnose.
	if (!phone)
		return errorOutput({
			code: 'NOT_PROVISIONED',
			message: 'Calling is not available for this user on this page.',
		});

	try {
		const result = await action(phone);
		return new FunctionOutput([EventResult.outputOf(new Map([['result', result]]))]);
	} catch (error) {
		return errorOutput(asSoftphoneError(error));
	}
}

function errorOutput(error: SoftphoneError): FunctionOutput {
	return new FunctionOutput([
		EventResult.of(
			Event.ERROR,
			new Map<string, any>([
				['data', error],
				// Lifted out of `data` as well, so a page can branch on the code without reaching
				// into an object - the whole point of having distinct codes is that the UI can say
				// "your microphone is blocked" rather than "calling failed".
				['code', error.code],
				['message', error.message],
			]),
		),
	]);
}

function asSoftphoneError(error: unknown): SoftphoneError {
	if (error && typeof error === 'object' && 'code' in error && 'message' in error)
		return error as SoftphoneError;
	return {
		code: 'NO_ACTIVE_CALL',
		message: error instanceof Error ? error.message : 'The call control failed.',
	};
}
