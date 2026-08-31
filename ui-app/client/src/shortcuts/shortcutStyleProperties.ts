import { StylePropertyDefinition } from '../types/common';

/**
 * Theme variables for the three global shortcut surfaces: the conflict chooser,
 * the hold-to-reveal overlay and the cheat sheet.
 *
 * These are ordinary local style properties, not the externalised
 * `dist/styleProperties/*.json` kind, so adding variables here is free.
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'shortcutBackdropBackgroundColor',
		cp: 'background-color',
		dn: 'Shortcut Backdrop Colour',
		de: 'Backdrop behind the shortcut chooser and the cheat sheet',
		dv: 'rgba(0, 0, 0, 0.35)',
		gn: 'Shortcuts',
		sel: '._shortcutBackdrop',
	},
	{
		n: 'shortcutPanelBackgroundColor',
		cp: 'background-color',
		dn: 'Shortcut Panel Background',
		de: 'Background of the shortcut chooser and cheat sheet panels',
		dv: '<backgroundColorSeven>',
		gn: 'Shortcuts',
		sel: '._shortcutPanel',
	},
	{
		n: 'shortcutPanelFontColor',
		cp: 'color',
		dn: 'Shortcut Panel Text Colour',
		de: 'Text colour inside the shortcut panels',
		dv: '<fontColorOne>',
		gn: 'Shortcuts',
		sel: '._shortcutPanel',
	},
	{
		n: 'shortcutPanelFont',
		cp: 'font',
		dn: 'Shortcut Panel Font',
		de: 'Font used inside the shortcut panels',
		dv: '<tertiaryFont>',
		gn: 'Shortcuts',
		sel: '._shortcutPanel',
	},
	{
		n: 'shortcutPanelBorderRadius',
		cp: 'border-radius',
		dn: 'Shortcut Panel Border Radius',
		de: 'Corner radius of the shortcut panels',
		dv: '8px',
		gn: 'Shortcuts',
		sel: '._shortcutPanel',
	},
	{
		n: 'shortcutPanelBoxShadow',
		cp: 'box-shadow',
		dn: 'Shortcut Panel Shadow',
		de: 'Shadow cast by the shortcut panels',
		dv: '0 10px 30px rgba(0, 0, 0, 0.2)',
		gn: 'Shortcuts',
		sel: '._shortcutPanel',
	},
	{
		n: 'shortcutPanelHeaderFontColor',
		cp: 'color',
		dn: 'Shortcut Panel Header Colour',
		de: 'Colour of the panel heading text',
		dv: '<fontColorEight>',
		gn: 'Shortcuts',
		sel: '._shortcutPanelHeader',
	},
	{
		n: 'shortcutGroupHeaderFontColor',
		cp: 'color',
		dn: 'Shortcut Group Header Colour',
		de: 'Colour of a group heading in the cheat sheet',
		dv: '<fontColorEight>',
		gn: 'Shortcuts',
		sel: '._shortcutGroupHeader',
	},
	{
		n: 'shortcutOptionActiveBackgroundColor',
		cp: 'background-color',
		dn: 'Shortcut Option Active Background',
		de: 'Background of the highlighted chooser row',
		dv: '<backgroundColorNine>',
		gn: 'Shortcuts',
		sel: '._shortcutOption._active',
	},
	{
		n: 'shortcutKeyCapBackgroundColor',
		cp: 'background-color',
		dn: 'Shortcut Key Cap Background',
		de: 'Background of the key cap shown beside each action',
		dv: '<backgroundColorNine>',
		gn: 'Shortcuts',
		sel: '._shortcutKeyCap',
	},
	{
		n: 'shortcutKeyCapFontColor',
		cp: 'color',
		dn: 'Shortcut Key Cap Text Colour',
		de: 'Text colour of the key cap',
		dv: '<fontColorOne>',
		gn: 'Shortcuts',
		sel: '._shortcutKeyCap',
	},
	{
		n: 'shortcutRevealChipBackgroundColor',
		cp: 'background-color',
		dn: 'Shortcut Reveal Chip Background',
		de: 'Background of the chips shown while a modifier is held',
		dv: '<backgroundColorSix>',
		gn: 'Shortcuts',
		sel: '._shortcutRevealChip',
	},
	{
		n: 'shortcutRevealChipFontColor',
		cp: 'color',
		dn: 'Shortcut Reveal Chip Text Colour',
		de: 'Text colour of the chips shown while a modifier is held',
		dv: '<fontColorTwo>',
		gn: 'Shortcuts',
		sel: '._shortcutRevealChip',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
