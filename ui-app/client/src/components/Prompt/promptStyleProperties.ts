import { StylePropertyDefinition } from '../../types/common';

/**
 * The chat's palette, as theme variables.
 *
 * PromptStyle.tsx hard-codes its own greys, its own font stack and a white
 * surface, which is fine for a full-page AI screen and wrong everywhere else:
 * embedded in a builder panel it reads as a foreign white box. These rules are
 * appended AFTER the base stylesheet by `processStyleDefinition`, so declaring a
 * property here overrides the literal without touching 2,400 lines of layout.
 *
 * Every default is the literal the component ships today, so an app that sets
 * none of these looks exactly as it did. Theming is opt-in per key.
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	// ─── Shell ───
	{
		gn: 'Prompt Surface',
		dn: 'Prompt Background',
		n: 'promptBackground',
		dv: '#ffffff',
		cp: 'background',
		sel: '.comp.compPrompt',
		np: true,
	},
	{
		gn: 'Prompt Surface',
		dn: 'Prompt Font Family',
		n: 'promptFontFamily',
		dv: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		cp: 'font-family',
		sel: '.comp.compPrompt',
		np: true,
	},
	{
		gn: 'Prompt Surface',
		dn: 'Prompt Font Color',
		n: 'promptFontColor',
		dv: '#1a1a1a',
		cp: 'color',
		sel: '.comp.compPrompt',
		np: true,
	},
	{
		gn: 'Prompt Surface',
		dn: 'Prompt Border Color',
		n: 'promptBorderColor',
		dv: '#e5e5e5',
		cp: 'border-color',
		sel: '.comp.compPrompt ._sessionSidebar, .comp.compPrompt ._inputContainer',
		np: true,
	},

	// ─── Session sidebar ───
	{
		gn: 'Prompt Sidebar',
		dn: 'Sidebar Background',
		n: 'promptSidebarBackground',
		dv: '#f9f9f9',
		cp: 'background',
		sel: '.comp.compPrompt ._sessionSidebar',
		np: true,
	},
	{
		gn: 'Prompt Sidebar',
		dn: 'Session Hover Background',
		n: 'promptSessionHoverBackground',
		dv: '#f0f0f0',
		cp: 'background',
		sel: '.comp.compPrompt ._sessionItem:hover',
		np: true,
	},
	{
		gn: 'Prompt Sidebar',
		dn: 'Session Selected Background',
		n: 'promptSessionActiveBackground',
		dv: '#ececec',
		cp: 'background',
		sel: '.comp.compPrompt ._sessionItem._active',
		np: true,
	},

	// ─── Messages ───
	{
		gn: 'Prompt Messages',
		dn: 'User Message Background',
		n: 'promptUserMessageBackground',
		dv: '#f4f4f4',
		cp: 'background',
		sel: '.comp.compPrompt ._promptMessage._user',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'User Message Font Color',
		n: 'promptUserMessageFontColor',
		dv: '#1a1a1a',
		cp: 'color',
		sel: '.comp.compPrompt ._promptMessage._user',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'User Message Border Radius',
		n: 'promptUserMessageBorderRadius',
		dv: '20px',
		cp: 'border-radius',
		sel: '.comp.compPrompt ._promptMessage._user',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'Assistant Font Color',
		n: 'promptAssistantFontColor',
		dv: '#1a1a1a',
		cp: 'color',
		sel: '.comp.compPrompt ._assistantContent',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'Inline Code Background',
		n: 'promptInlineCodeBackground',
		dv: '#f4f4f4',
		cp: 'background',
		sel: '.comp.compPrompt ._assistantContent code',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'Code Block Background',
		n: 'promptCodeBlockBackground',
		dv: '#1e1e1e',
		cp: 'background',
		sel: '.comp.compPrompt ._assistantContent pre',
		np: true,
	},
	{
		gn: 'Prompt Messages',
		dn: 'Code Block Font Color',
		n: 'promptCodeBlockFontColor',
		dv: '#d4d4d4',
		cp: 'color',
		sel: '.comp.compPrompt ._assistantContent pre',
		np: true,
	},

	// ─── Composer ───
	{
		gn: 'Prompt Composer',
		dn: 'Input Background',
		n: 'promptInputBackground',
		dv: '#f4f4f4',
		cp: 'background',
		sel: '.comp.compPrompt ._inputContainer',
		np: true,
	},
	{
		gn: 'Prompt Composer',
		dn: 'Input Focus Background',
		n: 'promptInputFocusBackground',
		dv: '#ffffff',
		cp: 'background',
		sel: '.comp.compPrompt ._inputContainer:focus-within',
		np: true,
	},
	{
		gn: 'Prompt Composer',
		dn: 'Input Focus Border Color',
		n: 'promptInputFocusBorderColor',
		dv: '#d0d0d0',
		cp: 'border-color',
		sel: '.comp.compPrompt ._inputContainer:focus-within',
		np: true,
	},
	{
		gn: 'Prompt Composer',
		dn: 'Input Border Radius',
		n: 'promptInputBorderRadius',
		dv: '24px',
		cp: 'border-radius',
		sel: '.comp.compPrompt ._inputContainer',
		np: true,
	},
	{
		gn: 'Prompt Composer',
		dn: 'Input Font Color',
		n: 'promptInputFontColor',
		dv: '#1a1a1a',
		cp: 'color',
		sel: '.comp.compPrompt ._inputContainer textarea',
		np: true,
	},
	{
		gn: 'Prompt Composer',
		dn: 'Placeholder Font Color',
		n: 'promptPlaceholderFontColor',
		dv: '#9b9b9b',
		cp: 'color',
		sel: '.comp.compPrompt ._inputContainer textarea::placeholder',
		np: true,
	},

	// ─── Accent (send, active affordances) ───
	{
		gn: 'Prompt Accent',
		dn: 'Send Button Background',
		n: 'promptAccentBackground',
		dv: '#1a1a1a',
		cp: 'background',
		sel: '.comp.compPrompt ._sendButton',
		np: true,
	},
	{
		gn: 'Prompt Accent',
		dn: 'Send Button Font Color',
		n: 'promptAccentFontColor',
		dv: '#ffffff',
		cp: 'color',
		sel: '.comp.compPrompt ._sendButton',
		np: true,
	},
	{
		gn: 'Prompt Accent',
		dn: 'Send Button Disabled Background',
		n: 'promptAccentDisabledBackground',
		dv: '#d0d0d0',
		cp: 'background',
		sel: '.comp.compPrompt ._sendButton:disabled',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = styleProperties;
