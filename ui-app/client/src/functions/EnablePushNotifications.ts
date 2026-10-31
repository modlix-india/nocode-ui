import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('EnablePushNotifications')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['status', Schema.ofString('status')],
					['registered', Schema.ofBoolean('registered')],
				]),
			),
			Event.eventMapEntry(Event.ERROR, new Map([['error', Schema.ofAny('error')]])),
		]),
	)
	.setDescription(
		'Asks to show notifications on this device and registers it for push for the signed-in user.',
	)
	.setDocumentation(
		"# UIEngine.EnablePushNotifications\n\nTurns on push notifications for the signed-in user on this device: the browser (Web Push) or, inside the Modlix mobile app, the phone. Asks the user for permission when they have not decided yet, then registers the device with the notification service, so the app's notifications reach it while the app is closed.\n\nRun it from a click: browsers ignore a permission prompt that no click started.\n\nPush is only available in an app that has notifications (a notification definition with an `inapp` or `push` channel); elsewhere it answers `unsupported` and registers nothing.\n\n## Events\n\n- **output**:\n  - **status** (String): `granted`, `denied` (the user said no, only they can undo it in the browser or phone settings), `default` (they closed the prompt) or `unsupported` (this browser, or this app, has no push).\n  - **registered** (Boolean): whether the device is now registered.\n- **error**: the registration failed (`error` holds the reason).\n\n## Use Cases\n\n- **Enable notifications button** in the notification panel, hidden once `UIEngine.GetPushStatus` answers `granted` or `unsupported`.",
	);

export class EnablePushNotifications extends AbstractFunction {
	protected async internalExecute(_: FunctionExecutionParameters): Promise<FunctionOutput> {
		try {
			const { enablePush } = await import(
				/* webpackChunkName: "PushRegistration" */ '../util/pushRegistration'
			);
			const { status, registered } = await enablePush(true);
			return new FunctionOutput([
				EventResult.outputOf(
					new Map<string, any>([
						['status', status],
						['registered', registered],
					]),
				),
			]);
		} catch (error: any) {
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map([['error', error?.message ?? String(error)]])),
				EventResult.outputOf(
					new Map<string, any>([
						['status', 'unsupported'],
						['registered', false],
					]),
				),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
