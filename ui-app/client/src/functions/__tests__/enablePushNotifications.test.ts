import { FunctionExecutionParameters } from '@fincity/kirun-js';
import { EnablePushNotifications } from '../EnablePushNotifications';
import { enablePush } from '../../util/pushRegistration';
import { isNativeShell } from '../../util/pushGate';

jest.mock('../../util/pushRegistration', () => ({ enablePush: jest.fn() }));
jest.mock('../../util/pushGate', () => ({ isNativeShell: jest.fn() }));

const order: string[] = [];
const requestPermission = jest.fn(async () => {
	order.push('ask');
	return 'granted';
});

async function run() {
	const out = await (new EnablePushNotifications() as any).internalExecute(
		{} as FunctionExecutionParameters,
	);
	return out.next().getResult();
}

beforeEach(() => {
	order.length = 0;
	jest.clearAllMocks();
	(isNativeShell as jest.Mock).mockReturnValue(false);
	(enablePush as jest.Mock).mockImplementation(async () => {
		order.push('register');
		return { status: 'granted', registered: true };
	});
	(globalThis as any).Notification = { permission: 'default', requestPermission };
});

describe('UIEngine.EnablePushNotifications', () => {
	// Safari, iPhone home screen apps included, shows no prompt once a network call or a chunk
	// load came between the tap and the ask: the ask comes before anything else.
	it('asks for permission before loading the push code or reading the push settings', async () => {
		const r = await run();
		expect(order).toEqual(['ask', 'register']);
		expect(r.get('status')).toBe('granted');
		expect(r.get('registered')).toBe(true);
	});

	it('does not ask again once the person decided, nor inside the mobile app', async () => {
		(globalThis as any).Notification.permission = 'denied';
		await run();
		(globalThis as any).Notification.permission = 'default';
		(isNativeShell as jest.Mock).mockReturnValue(true);
		await run();
		expect(requestPermission).not.toHaveBeenCalled();
		expect(enablePush).toHaveBeenCalledTimes(2);
	});
});
