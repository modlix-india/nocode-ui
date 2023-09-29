import { AnimationEditor } from './AnimationEditor';
import { PositionEditor } from './PositionEditor';
import { SpacingEditor } from './SpacingEditor';
import { TypographyEditor } from './TypographyEditor';

export const Style_Group_Editors = new Map([
	['typography', { component: TypographyEditor, hasDetails: true, displayName: 'Typography' }],
	['animation', { component: AnimationEditor, hasDetails: false, displayName: 'Animation' }],
	['position', { component: PositionEditor, hasDetails: false, displayName: 'Position' }],
	['spacing', { component: SpacingEditor, hasDetails: false, displayName: 'Sapcing' }],
]);
