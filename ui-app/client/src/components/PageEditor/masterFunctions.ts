interface MasterFunctionOptions {
	iframe: HTMLIFrameElement;
	editPageDefinition: any;
	defPath: string | undefined;
	personalizationPath: string | undefined;
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
				payload: 'PAGE',
			});

			options.iframe.contentWindow?.postMessage({
				type: 'EDITOR_DEFINITION',
				payload: options.editPageDefinition,
			});
		},
	],
]);
