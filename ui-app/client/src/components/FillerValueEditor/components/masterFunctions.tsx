interface MasterFunctionOptions {
	iframe: HTMLIFrameElement;
}

export const MASTER_FUNCTIONS = new Map<
	string,
	(options: MasterFunctionOptions, payload: any) => void
>([
	[
		'SLAVE_STARTED',
		options => {
			options.iframe.contentWindow?.postMessage({
				type: 'EDITOR_TYPE',
				payload: { type: 'FILLER_VALUE_EDITOR' },
			});
		},
	],
]);
