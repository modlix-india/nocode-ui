// The cheap checks that decide whether push code loads at all. No imports, so the App can call
// it on every sign-in without pulling pushRegistration into the main bundle: a site (nobody
// granted it push) and a browser without push never load or register anything.

/** Inside the Modlix mobile app's WebView (its user agent carries ModlixApp/<version>). */
export function isNativeShell(): boolean {
	return (
		typeof window !== 'undefined' &&
		!!(globalThis as any).flutter_inappwebview?.callHandler &&
		/ModlixApp\//.test(navigator.userAgent)
	);
}

function permissionGranted(): boolean {
	return (
		typeof Notification !== 'undefined' &&
		Notification.permission === 'granted' &&
		'serviceWorker' in navigator
	);
}

/** Whether this browser or phone could hold a push registration to remove on sign-out. */
export function pushMayBeRegistered(): boolean {
	return isNativeShell() || permissionGranted();
}

let resumedFor: string | undefined;

/**
 * After sign-in: re-register the device when push was turned on before (permission granted, or
 * the mobile app). Waits for the page to settle first, and runs once per signed-in user.
 */
export function resumePushAfterSignIn(userId: string | number | undefined): void {
	if (userId === undefined || userId === null || globalThis.isDesignMode) return;
	const key = String(userId);
	if (resumedFor === key || (!isNativeShell() && !permissionGranted())) return;
	resumedFor = key;
	setTimeout(() => {
		import(/* webpackChunkName: "PushRegistration" */ './pushRegistration').then(m =>
			m.resumePush(),
		);
	}, 3000);
}
