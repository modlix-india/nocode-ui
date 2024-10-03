import React from 'react';
import { StyleEditorsProps } from '../simpleEditors';
import { BorderCollapseEditor } from './BorderCollapseEditor';
import { BorderImageEditor } from './BorderImageEditor';
import { BorderLikeEditor } from './BorderLikeEditor';
import { BorderRadiusLikeEditor } from './BorderRadiusLikeEditor';

export function BorderEditor(props: Readonly<StyleEditorsProps>) {
	if (!props.isDetailStyleEditor) {
		return (
			<>
				<BorderLikeEditor {...props} />
				<BorderRadiusLikeEditor {...props} />
			</>
		);
	}

	return (
		<>
			<BorderCollapseEditor {...props} />
			<BorderImageEditor {...props} />
			<div className="_combineEditors">
				<div className="_simpleLabel">Block/Inline Style</div>
			</div>
			<BorderLikeEditor
				{...props}
				fixedDirectionLabel="blockStart"
				valueBagDirectionLabels={['blockStart', 'blockEnd', 'inlineStart', 'inlineEnd']}
				valueBagDirectionLabelDescriptions={{
					blockStart: 'Block Start',
					blockEnd: 'Block End',
					inlineStart: 'Inline Start',
					inlineEnd: 'Inline End',
				}}
				showAdvancedLineStyles={false}
			/>
			<div className="_combineEditors">
				<div className="_simpleLabel">Logical Border Radius</div>
			</div>
			<BorderRadiusLikeEditor
				{...props}
				fixedDirectionLabel="startStart"
				valueBagDirectionLabels={['startStart', 'startEnd', 'endStart', 'endEnd']}
				valueBagDirectionLabelDescriptions={{
					startStart: 'Start Start',
					startEnd: 'Start End',
					endStart: 'End Start',
					endEnd: 'End End',
				}}
				showEllipticalRadius={true}
			/>
		</>
	);
}
