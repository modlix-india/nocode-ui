/**
 * What a toast says for each shape a message arrives in. Error bodies from the Rust units add
 * `action` and `code` to Java's `{ message, debugMessage, stackTrace, exceptionId }`; services
 * that answer with an empty or non-JSON body (Java's 401 and 403, a proxy's 502 to 504) get the
 * platform's default text for their status instead of an empty toast.
 */
import { copyText, errorEventData, messageDetails, textForStatus } from '../messageDetails';

const CODED = {
	exceptionId: '2026-10-17-1f2e3d',
	code: 'COMMON.PERMISSION_REQUIRED',
	message: "You can't do this: your account does not have the Edit pages permission.",
	action: 'Ask an owner of your organisation to give you the Edit pages permission.',
	params: { permission: 'the Edit pages permission' },
	locale: 'en',
	stackTrace: '',
	debugMessage: 'Access Denied: needs Authorities.Page_UPDATE',
};

const JAVA = {
	exceptionId: '2026-10-17-aa11',
	message: 'Cannot create Transport for the selected client',
	stackTrace: 'at com.fincity...',
	debugMessage: 'Cannot create Transport for the selected client',
};

function axiosError(status: number | undefined, data: unknown) {
	return {
		isAxiosError: true,
		message: status ? `Request failed with status code ${status}` : 'Network Error',
		response: status ? { status, data, headers: {} } : undefined,
	};
}

describe('messageDetails', () => {
	it('shows a string or a number as it is', () => {
		expect(messageDetails('Saved', 'SUCCESS')).toEqual({ text: 'Saved' });
		expect(messageDetails(42, 'INFORMATION')).toEqual({ text: 42 });
		expect(messageDetails('', 'SUCCESS')).toEqual({ text: '' });
	});

	it('shows a coded body with its next step and error id', () => {
		expect(messageDetails(CODED, 'ERROR')).toEqual({
			text: CODED.message,
			action: CODED.action,
			errorId: CODED.exceptionId,
			debugMessage: CODED.debugMessage,
		});
	});

	it('shows a Java body as before: its message, no action', () => {
		expect(messageDetails(JAVA, 'ERROR')).toEqual({
			text: JAVA.message,
			errorId: JAVA.exceptionId,
			debugMessage: JAVA.debugMessage,
			stackTrace: JAVA.stackTrace,
		});
	});

	it('reads the body inside an axios error', () => {
		const d = messageDetails(axiosError(403, CODED), 'ERROR');
		expect([d.text, d.action, d.errorId]).toEqual([
			CODED.message,
			CODED.action,
			CODED.exceptionId,
		]);
	});

	it.each([
		[401, "You're signed out. Please sign in again.", undefined],
		[
			403,
			"You don't have access to this.",
			'If you think you should, ask an owner of your organisation.',
		],
		[502, 'The service is restarting. Try again in a few seconds.', undefined],
		[503, 'The service is restarting. Try again in a few seconds.', undefined],
		[504, 'The service took too long to answer.', 'Try again.'],
		[500, 'Something went wrong on our side.', 'Try again in a moment.'],
		[507, 'Something went wrong on our side.', 'Try again in a moment.'],
	])('says something for an empty %i', (status, text, action) => {
		expect(messageDetails(axiosError(status, ''), 'ERROR')).toEqual({ text, action });
		// A proxy's HTML page is not shown either.
		expect(messageDetails(axiosError(status, '<html>Bad Gateway</html>'), 'ERROR').text).toBe(
			text,
		);
		// FetchData's error event passed whole, as an object or as the event's Map.
		expect(messageDetails({ data: '', headers: {}, status }, 'ERROR').text).toBe(text);
		expect(
			messageDetails(
				new Map<string, any>([
					['data', ''],
					['status', status],
				]),
				'ERROR',
			).text,
		).toBe(text);
	});

	it("reads Spring's own error body by its status", () => {
		const gateway = {
			timestamp: '2026-10-17T10:00:00Z',
			path: '/api/ui/pages',
			status: 503,
			error: 'Service Unavailable',
		};
		expect(messageDetails(gateway, 'ERROR').text).toBe(
			'The service is restarting. Try again in a few seconds.',
		);
	});

	it('keeps axios text for a status without a default, and for no answer at all', () => {
		expect(messageDetails(axiosError(404, ''), 'ERROR').text).toBe(
			'Request failed with status code 404',
		);
		expect(messageDetails(axiosError(undefined, undefined), 'ERROR').text).toBe(
			'Network Error',
		);
	});

	it('reads a coded body inside a FetchData error event', () => {
		const d = messageDetails(
			new Map<string, any>([
				['data', CODED],
				['headers', {}],
				['status', 403],
			]),
			'ERROR',
		);
		expect([d.text, d.action, d.errorId]).toEqual([
			CODED.message,
			CODED.action,
			CODED.exceptionId,
		]);
	});

	it('shows a thrown error by its message', () => {
		expect(messageDetails(new Error('Executing step returned no events'), 'ERROR').text).toBe(
			'Executing step returned no events',
		);
	});

	it('never leaves an error toast empty', () => {
		const nothing = {
			text: 'Your request could not be completed.',
			action: 'Try again in a moment.',
		};
		expect(messageDetails('', 'ERROR')).toEqual(nothing);
		expect(messageDetails(undefined, 'ERROR')).toEqual(nothing);
		expect(messageDetails({}, 'ERROR')).toEqual(nothing);
		expect(messageDetails({ message: { nested: true } }, 'ERROR')).toEqual(nothing);
		expect(messageDetails({}, 'WARNING')).toEqual({});
	});

	it('has defaults only for the statuses that need one', () => {
		expect(textForStatus(404)).toBeUndefined();
		expect(textForStatus('500')).toBeUndefined();
		expect(textForStatus(501)?.text).toBe('Something went wrong on our side.');
	});
});

describe('errorEventData', () => {
	it('gives an empty or missing body the text for its status', () => {
		expect(errorEventData('', 401)).toEqual({
			message: "You're signed out. Please sign in again.",
			status: 401,
		});
		expect(errorEventData(undefined, 403)).toEqual({
			message: "You don't have access to this.",
			action: 'If you think you should, ask an owner of your organisation.',
			status: 403,
		});
		expect(errorEventData(null, 503)).toEqual({
			message: 'The service is restarting. Try again in a few seconds.',
			status: 503,
		});
	});

	it("replaces a proxy's HTML page, and says something when nothing answered", () => {
		expect(errorEventData('  <html><body>502 Bad Gateway</body></html>', 502)).toEqual({
			message: 'The service is restarting. Try again in a few seconds.',
			status: 502,
		});
		expect(errorEventData(undefined, undefined)).toEqual({
			message: 'Your request could not be completed.',
			action: 'Try again in a moment.',
		});
	});

	it('passes a readable body on as it came', () => {
		expect(errorEventData(CODED, 403)).toBe(CODED);
		expect(errorEventData('Access Denied', 403)).toBe('Access Denied');
		expect(errorEventData([1], 400)).toEqual([1]);
	});

	it('reads in the toast as the status text', () => {
		const event = new Map<string, any>([
			['data', errorEventData('', 403)],
			['status', 403],
		]);
		expect(messageDetails(event, 'ERROR')).toMatchObject({
			text: "You don't have access to this.",
			action: 'If you think you should, ask an owner of your organisation.',
		});
	});
});

describe('copyText', () => {
	const nav = globalThis.navigator as any;
	const original = nav.clipboard;
	afterEach(() => {
		Object.defineProperty(nav, 'clipboard', { configurable: true, value: original });
		delete (document as any).execCommand;
	});

	it('uses the clipboard', async () => {
		const writeText = jest.fn().mockResolvedValue(undefined);
		Object.defineProperty(nav, 'clipboard', { configurable: true, value: { writeText } });
		await expect(copyText('2026-10-17-1f2e3d')).resolves.toBe(true);
		expect(writeText).toHaveBeenCalledWith('2026-10-17-1f2e3d');
	});

	it('falls back to a selection where the clipboard is refused or missing', async () => {
		const writeText = jest.fn().mockRejectedValue(new Error('not allowed'));
		Object.defineProperty(nav, 'clipboard', { configurable: true, value: { writeText } });
		(document as any).execCommand = jest.fn().mockReturnValue(true);
		await expect(copyText('id')).resolves.toBe(true);
		expect((document as any).execCommand).toHaveBeenCalledWith('copy');
		expect(document.querySelector('textarea')).toBeNull();

		Object.defineProperty(nav, 'clipboard', { configurable: true, value: undefined });
		(document as any).execCommand = jest.fn(() => {
			throw new Error('blocked');
		});
		await expect(copyText('id')).resolves.toBe(false);
	});
});
