import { Event, EventResult, FunctionOutput } from '@fincity/kirun-js';
import { asError } from '../../softphone/errors';
import { softphoneRegistry } from '../../softphone/registry';
import { SoftphoneError, SoftphoneFacade } from '../../softphone/types';

/**
 * A failed control fires `error` and not `output`, unlike the data functions, so a page never
 * opens a call window for a refused dial.
 */
export async function runSoftphoneControl<T>(
	action: (phone: SoftphoneFacade) => Promise<T>,
): Promise<FunctionOutput> {
	const phone = softphoneRegistry.current();

	// Undefined: calling is not set up for this user, or no Softphone is mounted.
	if (!phone)
		return errorOutput({
			code: 'NOT_PROVISIONED',
			message: 'Calling is not available for this user on this page.',
		});

	try {
		const result = await action(phone);
		return new FunctionOutput([EventResult.outputOf(new Map([['result', result]]))]);
	} catch (error) {
		return errorOutput(asError(error, 'NO_ACTIVE_CALL', 'The call control failed.'));
	}
}

function errorOutput(error: SoftphoneError): FunctionOutput {
	return new FunctionOutput([
		EventResult.of(
			Event.ERROR,
			new Map<string, any>([
				['data', error],
				// Lifted out of `data` so a page can branch on the code directly.
				['code', error.code],
				['message', error.message],
			]),
		),
	]);
}
