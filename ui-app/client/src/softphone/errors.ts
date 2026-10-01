import { SoftphoneError, SoftphoneErrorCode } from './types';

export function serverMessage(e: unknown): string | undefined {
	const message = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
	return typeof message === 'string' && message.trim() ? message : undefined;
}

/** Typed so a code added to `SoftphoneErrorCode` without a line here is a compile error. */
const SOFTPHONE_ERROR_CODES: Record<SoftphoneErrorCode, true> = {
	MIC_DENIED: true,
	INSECURE_CONTEXT: true,
	SDK_LOAD_FAILED: true,
	INIT_FAILED: true,
	NOT_PROVISIONED: true,
	TOKEN_FAILED: true,
	REGISTRATION_FAILED: true,
	DIAL_REJECTED: true,
	RELAY_TIMEOUT: true,
	NO_ACTIVE_CALL: true,
	INVALID_INPUT: true,
	UNSUPPORTED_CONTROL: true,
};

/**
 * Passes through only errors whose code is ours, copied field by field. An Axios error also has a
 * `code` and `message`; passing it whole would put its request headers, auth token included,
 * into `Store.softphone.lastError`.
 */
export function asError(
	e: unknown,
	fallbackCode: SoftphoneError['code'],
	fallback: string,
): SoftphoneError {
	if (e && typeof e === 'object') {
		const { code, message } = e as { code?: unknown; message?: unknown };
		if (
			typeof code === 'string' &&
			// Own keys only: `in` also finds prototype members such as `constructor`.
			Object.prototype.hasOwnProperty.call(SOFTPHONE_ERROR_CODES, code) &&
			typeof message === 'string'
		)
			return { code: code as SoftphoneErrorCode, message };
	}

	if ((e as { isAxiosError?: unknown })?.isAxiosError)
		return { code: fallbackCode, message: serverMessage(e) ?? fallback };

	return { code: fallbackCode, message: e instanceof Error ? e.message : fallback };
}
