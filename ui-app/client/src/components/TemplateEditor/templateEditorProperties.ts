import { SCHEMA_ANY_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'templateType',
		displayName: 'Locked Template Type',
		description:
			'Optionally lock the editor to a single template type. Leave empty to let the user choose the type inside the editor.',
		schema: SCHEMA_STRING_COMP_PROP,
		enumValues: [
			{ name: 'email', displayName: 'Email' },
			{ name: 'pdf', displayName: 'PDF' },
			{ name: 'inapp', displayName: 'In App' },
			{ name: 'push', displayName: 'Push' },
			{ name: 'whatsapp', displayName: 'WhatsApp' },
			{ name: 'sms', displayName: 'SMS' },
		],
	},
	{
		name: 'aiEndpoint',
		displayName: 'AI Endpoint',
		description:
			"Endpoint the editor's AI tab posts prompts to (POST {prompt, template, language, part, templateType} -> {subject, html, message}). Leave empty to hide the AI tab.",
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: 'api/ai/appbuilder/template',
	},
	{
		name: 'editorLook',
		displayName: 'Editor Look',
		description:
			'Classic: the editor as before. Document: PDFs and emails open as the page they make, with blocks, fields as named chips, "show only if", AI and a preview on a real record or a sample set (Code stays one click away). Document for new templates: new templates and those made in the Document look open as a page, templates written in code open in Classic with "Open as page".',
		schema: SCHEMA_STRING_COMP_PROP,
		defaultValue: 'CLASSIC',
		enumValues: [
			{ name: 'CLASSIC', displayName: 'Classic' },
			{ name: 'AUTO', displayName: 'Document for new templates' },
			{ name: 'DOCUMENT', displayName: 'Document' },
		],
	},
	{
		name: 'previewRecords',
		displayName: 'Preview Records',
		description:
			'Document look: the records the preview can use, as a list of {id, label} (for example the cases of the organisation). Fill it in the On Preview Open event.',
		schema: SCHEMA_ANY_COMP_PROP,
	},
	{
		name: 'previewRecordData',
		displayName: 'Preview Record Data',
		description:
			'Document look: the data of the picked record, in the shape the template renders with. Fill it in the On Preview Record event (the picked id is at the second binding path).',
		schema: SCHEMA_ANY_COMP_PROP,
	},
	{
		name: 'compareTemplate',
		displayName: 'Compare Template',
		description:
			'Document look: another version to compare with (for a project or unit copy, the template it was copied from). Fill it in On Compare Open.',
		schema: SCHEMA_ANY_COMP_PROP,
	},
	{
		name: 'compareLabel',
		displayName: 'Compare Label',
		description:
			'Document look: the name of that version in words, for example "Allotment letter (project default)".',
		schema: SCHEMA_STRING_COMP_PROP,
	},
	{
		name: 'onCompareOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Compare Open',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Document look: runs when Compare is opened, to load Compare Template.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onPreviewOpen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Preview Open',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Document look: runs when the "Preview with" list opens, to load Preview Records.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onPreviewRecord',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Preview Record',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Document look: runs after a record is picked (its id is written to the second binding path), to load Preview Record Data.',
		group: ComponentPropertyGroup.EVENTS,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
