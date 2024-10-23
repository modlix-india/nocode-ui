import React from 'react';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorType,
	StyleEditorsProps,
} from './simpleEditors';
import TextEditor from '../../../TextEditor/TextEditor';
import { MultipleValueEditor } from './simpleEditors/MultipleValueEditor';
import AnyField from '../../../SchemaBuilder/components/AnyField';

export function LayoutEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <DetailedLayoutEditor {...props} />;
	}
	return <LayoutStandardEditor {...props} />;
}

function DetailedLayoutEditor(props: Readonly<StyleEditorsProps>) {
	const { subComponentName, pseudoState, iterateProps, selectorPref, styleProps } = props;
	const {
		selectedComponent,
		selectedComponentsList,
		saveStyle,
		properties,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;
	return (
		<>
			<div className="_combineEditors">Justify Items</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifyItems"
				placeholder="Justify Items"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm4-14h2v14H7V5zm8 0h2v14h-2V5z" />
								</g>
							),
						},
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 11h16v2H4z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h16v2H4V4zm0 6h10v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 18h16v2H4v-2zm6-6h10v2H10v-2z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h2v18H3V3zm4 0h14v6H7V3z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 3h2v18h-2V3zM3 15h14v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'self-start',
							description: 'Self Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v10h-6V4z" />
								</g>
							),
						},
						{
							name: 'self-end',
							description: 'Self End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 10h6v10H4V10z" />
								</g>
							),
						},
						{
							name: 'left',
							description: 'Left',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v2h-6V4zm0 6h6v2h-6v-2zm0 6h6v2h-6v-2z" />
								</g>
							),
						},
						{
							name: 'right',
							description: 'Right',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 4h6v2H4V4zm0 6h6v2H4v-2zm0 6h6v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'anchor-center',
							description: 'Anchor Center',
							icon: (
								<g transform="translate(2 2)">
									<circle cx="12" cy="12" r="4" />
									<path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
								</g>
							),
						},
						{
							name: 'baseline',
							description: 'Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-4h2v4H6zm5-6h2v10h-2zm5 3h2v7h-2z" />
								</g>
							),
						},
						{
							name: 'first baseline',
							description: 'First Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-8h2v8H6zm5-4h2v12h-2zm5 2h2v10h-2z" />
								</g>
							),
						},
						{
							name: 'last baseline',
							description: 'Last Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-12h2v12H6zm5 4h2v8h-2zm5 2h2v6h-2z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'legacy right',
							description: 'Legacy Right',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 4h6v2H4V4zm0 6h6v2H4v-2zm0 6h6v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'legacy left',
							description: 'Legacy Left',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v2h-6V4zm0 6h6v2h-6v-2zm0 6h6v2h-6v-2z" />
								</g>
							),
						},
						{
							name: 'legacy center',
							description: 'Legacy Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M8 4h8v16H8V4zM4 4h2v2H4V4zm0 6h2v2H4v-2zm0 6h2v2H4v-2zm14-12h2v2h-2V4zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>
			<div className="_combineEditors">Justify Self</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifySelf"
				placeholder="Justify Self"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'auto',
							description: 'Auto',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
								</g>
							),
						},
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm4-14h2v14H7V5zm8 0h2v14h-2V5z" />
								</g>
							),
						},
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 11h16v2H4z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h16v2H4V4zm0 6h10v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 18h16v2H4v-2zm6-6h10v2H10v-2z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h2v18H3V3zm4 0h14v6H7V3z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 3h2v18h-2V3zM3 15h14v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'self-start',
							description: 'Self Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v10h-6V4z" />
								</g>
							),
						},
						{
							name: 'self-end',
							description: 'Self End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 10h6v10H4V10z" />
								</g>
							),
						},
						{
							name: 'left',
							description: 'Left',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v2h-6V4zm0 6h6v2h-6v-2zm0 6h6v2h-6v-2z" />
								</g>
							),
						},
						{
							name: 'right',
							description: 'Right',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 4h6v2H4V4zm0 6h6v2H4v-2zm0 6h6v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'anchor-center',
							description: 'Anchor Center',
							icon: (
								<g transform="translate(2 2)">
									<circle cx="12" cy="12" r="4" />
									<path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
								</g>
							),
						},
						{
							name: 'baseline',
							description: 'Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-4h2v4H6zm5-6h2v10h-2zm5 3h2v7h-2z" />
								</g>
							),
						},
						{
							name: 'first baseline',
							description: 'First Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-8h2v8H6zm5-4h2v12h-2zm5 2h2v10h-2z" />
								</g>
							),
						},
						{
							name: 'last baseline',
							description: 'Last Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-12h2v12H6zm5 4h2v8h-2zm5 2h2v6h-2z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>

			<div className="_combineEditors">Align Content</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignContent"
				placeholder="Align Content"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v6H3V3zm0 8h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 8h18v8H3V8z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 15h18v6H3v-6zm0-2h18v-2H3v2z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v6H3V3zm0 8h18v2H3v-2zm0 4h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 15h18v6H3v-6zm0-2h18v-2H3v2zm0-4h18v-2H3v2z" />
								</g>
							),
						},
						{
							name: 'baseline',
							description: 'Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 12h18v2H3v-2zm2-4h2v8H5V8zm5-3h2v14h-2V5zm5 6h2v8h-2v-8z" />
								</g>
							),
						},
						{
							name: 'first baseline',
							description: 'First Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 6h18v2H3V6zm2 4h2v10H5V10zm5-6h2v16h-2V4zm5 3h2v13h-2V7z" />
								</g>
							),
						},
						{
							name: 'last baseline',
							description: 'Last Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 18h18v2H3v-2zm2-14h2v14H5V4zm5 3h2v11h-2V7zm5 6h2v8h-2v-8z" />
								</g>
							),
						},
						{
							name: 'space-between',
							description: 'Space Between',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v4H3V3zm0 14h18v4H3v-4zm0-7h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'space-around',
							description: 'Space Around',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 12h18v2H3v-2zm0-6h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'space-evenly',
							description: 'Space Evenly',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm4-14h2v14H7V5zm8 0h2v14h-2V5z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>

			<div className="_combineEditors">Align Self</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignSelf"
				placeholder="Align Self"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'auto',
							description: 'Auto',
							icon: (
								<g transform="translate(11 9)">
									<path
										d="M4.32643 1C4.06219 1 3.84856 1.21363 3.84856 1.47786V11.3753L1.81342 9.35418C1.62509 9.16866 1.32432 9.16866 1.13879 9.35699C0.95327 9.54533 0.95327 9.8461 1.1416 10.0316L3.98911 12.8623C4.08187 12.955 4.20274 13 4.32643 13C4.45011 13 4.57098 12.955 4.66374 12.8623L7.51406 10.0316C7.70239 9.8461 7.70239 9.54252 7.51687 9.35699C7.33134 9.16866 7.02776 9.16866 6.84224 9.35418L4.80429 11.3753V1.47786C4.80429 1.21644 4.59066 1 4.32643 1Z"
										fillOpacity="0.25"
										transform="translate(2,0)"
									/>
								</g>
							),
						},
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 11h16v2H4z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 9h16v2H4V9zm6 4h10v2H10v-2z" />
								</g>
							),
						},
						{
							name: 'self-start',
							description: 'Self Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v10h-6V4z" />
								</g>
							),
						},
						{
							name: 'self-end',
							description: 'Self End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 10h6v10H4V10z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h2v18H3V3zm4 0h14v6H7V3z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 3h2v18h-2V3zM3 15h14v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'anchor-center',
							description: 'Anchor Center',
							icon: (
								<g transform="translate(2 2)">
									<circle cx="12" cy="12" r="4" />
									<path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
								</g>
							),
						},
						{
							name: 'baseline',
							description: 'Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-4h2v4H6zm5-6h2v10h-2zm5 3h2v7h-2z" />
								</g>
							),
						},
						{
							name: 'first baseline',
							description: 'First Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-8h2v8H6zm5-4h2v12h-2zm5 2h2v10h-2z" />
								</g>
							),
						},
						{
							name: 'last baseline',
							description: 'Last Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-12h2v12H6zm5 4h2v8h-2zm5 2h2v6h-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 3h16v2H4zm0 16h16v2H4zm4-14h2v14H8zm6 0h2v14h-2z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
							),
						},
					],
				}}
			/>
		</>
	);
}

function LayoutStandardEditor(props: Readonly<StyleEditorsProps>) {
	const { subComponentName, pseudoState, iterateProps, selectorPref, styleProps } = props;
	const {
		selectedComponent,
		selectedComponentsList,
		saveStyle,
		properties,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;

	const flexLogic = (values: Record<string, any>) => {
		const { flexGrow, flexShrink, flexBasis, flex } = values;

		if (flex === 'auto') {
			return { flexGrow: '1', flexShrink: '1', flexBasis: 'auto', flex: 'auto' };
		}
		if (flex === 'none') {
			return { flexGrow: '0', flexShrink: '0', flexBasis: 'auto', flex: 'none' };
		}

		const newFlex = `${flexGrow} ${flexShrink} ${flexBasis}`;
		return { flexGrow, flexShrink, flexBasis, flex: newFlex };
	};

	const flexRelatedProps = {
		props: ['flexGrow', 'flexShrink', 'flexBasis', 'flex'],
		logic: flexLogic,
	};

	const flexFlowLogic = (values: Record<string, any>) => {
		const { flexFlow, flexDirection, flexWrap } = values;

		if (flexFlow === 'auto') {
			return { flexDirection: 'row', flexWrap: 'nowrap' };
		}

		const newFlexFlow = `${flexDirection} ${flexWrap}`;
		return { flexDirection, flexWrap, flexFlow: newFlexFlow };
	};

	const flexFlowRelatedProps = {
		props: ['flexDirection', 'flexWrap'],
		logic: flexFlowLogic,
	};

	return (
		<>
			<div className="_combineEditors">Display</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="display"
				placeholder="Display"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'flex',
							description: 'Flex container',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v14H3V5zm2 2v10h14V7H5z" />
								</g>
							),
						},
						{
							name: 'none',
							description: 'Hide the element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
								</g>
							),
						},
						{
							name: 'block',
							description: 'Block-level element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'inline',
							description: 'Inline element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 11h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Default value',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
								</g>
							),
						},
						{
							name: 'contents',
							description: 'Contents only',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'inline-block',
							description: 'Inline-block element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h8v14H3V5zm10 0h8v14h-8V5z" />
								</g>
							),
						},
						{
							name: 'inline-flex',
							description: 'Inline flex container',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 11h18v2H3v-2zm2-4h14v10H5V7z" />
								</g>
							),
						},
						{
							name: 'grid',
							description: 'Grid container',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
								</g>
							),
						},
						{
							name: 'inline-grid',
							description: 'Inline grid container',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 11h18v2H3v-2zm2-6h4v4H5V5zm6 0h4v4h-4V5zm6 0h4v4h-4V5zm-12 6h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-12 6h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
								</g>
							),
						},
						{
							name: 'table',
							description: 'Table',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7v4h4V7H7zm6 0v4h4V7h-4zm-6 6v4h4v-4H7zm6 0v4h4v-4h-4z" />
								</g>
							),
						},
						{
							name: 'inline-table',
							description: 'Inline table',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 11h18v2H3v-2zm2-6h4v4H5V5zm6 0h4v4h-4V5zm6 0h4v4h-4V5zm-12 6h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-12 6h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
								</g>
							),
						},
						{
							name: 'table-row',
							description: 'Table row',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v6H3V5zm0 8h18v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'table-cell',
							description: 'Table cell',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h18V3H3zm8 16H5V5h6v14zm8 0h-6V5h6v14z" />
								</g>
							),
						},
						{
							name: 'table-column',
							description: 'Table column',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h6V3H3zm8 0v18h6V3h-6zm8 0v18h2V3h-2z" />
								</g>
							),
						},
						{
							name: 'table-row-group',
							description: 'Table row group',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v6h18V3H3zm0 8v4h18v-4H3zm0 6v6h18v-6H3z" />
								</g>
							),
						},
						{
							name: 'table-column-group',
							description: 'Table column group',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h6V3H3zm8 0v18h6V3h-6zm8 0v18h2V3h-2z" />
								</g>
							),
						},
						{
							name: 'table-header-group',
							description: 'Table header group',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v6h18V3H3zm0 8v12h18V11H3z" />
								</g>
							),
						},
						{
							name: 'table-footer-group',
							description: 'Table footer group',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v12h18V3H3zm0 14v4h18v-4H3z" />
								</g>
							),
						},
						{
							name: 'table-caption',
							description: 'Table caption',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v4h18V3H3zm0 6v12h18V9H3z" />
								</g>
							),
						},
						{
							name: 'flow-root',
							description: 'Flow root',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
								</g>
							),
						},
						{
							name: 'list-item',
							description: 'List item',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
								</g>
							),
						},
						{
							name: 'run-in',
							description: 'Run-in box',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h10v2H3V5zm12 0h6v2h-6V5zM3 9h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'subgrid',
							description: 'Subgrid',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit from parent',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z" />
								</g>
							),
						},
					],
				}}
			/>
			<div className="_combineEditors">Flex</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flex"
				placeholder="Flex"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Text }}
				relatedProps={flexRelatedProps}
			/>
			<div className="_combineEditors">Flex Grow</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexGrow"
				placeholder="Flex Grow"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Range, rangeMin: 0, rangeMax: 10 }}
				relatedProps={flexRelatedProps}
			/>
			<div className="_combineEditors">Flex Shrink</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexShrink"
				placeholder="Flex Shrink"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Range, rangeMin: 0, rangeMax: 10 }}
				relatedProps={flexRelatedProps}
			/>
			<div className="_combineEditors">Flex Basis</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexBasis"
				placeholder="Flex Basis"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize }}
				relatedProps={flexRelatedProps}
			/>
			<div className="_combineEditors">Flex Flow</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexFlow"
				placeholder="Flex Flow"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Text }}
				relatedProps={flexFlowRelatedProps}
			/>
			<div className="_combineEditors">Flex Direction</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexDirection"
				placeholder="Flex Direction"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				relatedProps={flexFlowRelatedProps}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'row',
							description: 'Row (left to right)',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 12h16M4 12l4-4m-4 4l4 4" />
								</g>
							),
						},
						{
							name: 'row-reverse',
							description: 'Row Reverse (right to left)',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 12H4m16 0l-4-4m4 4l-4 4" />
								</g>
							),
						},
						{
							name: 'column',
							description: 'Column (top to bottom)',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 4v16m0-16l-4 4m4-4l4 4" />
								</g>
							),
						},
						{
							name: 'column-reverse',
							description: 'Column Reverse (bottom to top)',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 20V4m0 16l-4-4m4 4l4-4" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit from parent element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Set to default value',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert to browser default',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert to previous cascade layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset this property',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>
			<div className="_combineEditors">Flex Wrap</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexWrap"
				placeholder="Flex Wrap"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				relatedProps={flexFlowRelatedProps}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'nowrap',
							description: 'No Wrap: All flex items will be on one line',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'wrap',
							description:
								'Wrap: Flex items will wrap onto multiple lines, from top to bottom',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 6h10v2H3v-2zm12 0h6v2h-6v-2zm-12 6h8v2H3v-2zm10 0h8v2h-8v-2z" />
								</g>
							),
						},
						{
							name: 'wrap-reverse',
							description:
								'Wrap Reverse: Flex items will wrap onto multiple lines from bottom to top',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 19h18v-2H3v2zm0-6h10v-2H3v2zm12 0h6v-2h-6v2zm-12-6h8V5H3v2zm10 0h8V5h-8v2z" />
								</g>
							),
						},
						{
							name: 'inherit',
							description:
								'Inherit: Inherits the flex-wrap property from its parent element',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial: Sets this property to its default value',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert: Reverts this property to the browser default',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description:
								'Revert Layer: Reverts to the value established in a previous cascade layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description:
								'Unset: Resets this property to its inherited value if inheritable, otherwise to its initial value',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>
			<div className="_combineEditors">Gap</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="gap"
				placeholder="Gap"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize }}
			/>
			<div className="_combineEditors">Justify Content</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifyContent"
				placeholder="Justify Content"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 11h16v2H4z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h16v2H4V4zm0 6h10v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 18h16v2H4v-2zm6-6h10v2H10v-2z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h2v18H3V3zm4 0h14v6H7V3z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 3h2v18h-2V3zM3 15h14v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'left',
							description: 'Left',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v2h-6V4zm0 6h6v2h-6v-2zm0 6h6v2h-6v-2z" />
								</g>
							),
						},
						{
							name: 'right',
							description: 'Right',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 4h6v2H4V4zm0 6h6v2H4v-2zm0 6h6v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'space-between',
							description: 'Space Between',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v4H3V3zm0 14h18v4H3v-4zm0-7h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'space-around',
							description: 'Space Around',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 12h18v2H3v-2zm0-6h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'space-evenly',
							description: 'Space Evenly',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm4-14h2v14H7V5zm8 0h2v14h-2V5z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>
			<div className="_combineEditors">Align Items</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignItems"
				placeholder="Align Items"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Icons,
					visibleIconCount: 3,
					iconButtonOptions: [
						{
							name: 'normal',
							description: 'Normal',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 5h18v2H3V5zm0 14h18v2H3v-2z" />
								</g>
							),
						},
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zm4-14h2v14H7zm8 0h2v14h-2z" />
								</g>
							),
						},
						{
							name: 'center',
							description: 'Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 11h16v2H4z" />
								</g>
							),
						},
						{
							name: 'start',
							description: 'Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h16v2H4V4zm0 6h10v2H4v-2z" />
								</g>
							),
						},
						{
							name: 'end',
							description: 'End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 18h16v2H4v-2zm6-6h10v2H10v-2z" />
								</g>
							),
						},
						{
							name: 'flex-start',
							description: 'Flex Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h2v18H3V3zm4 0h14v6H7V3z" />
								</g>
							),
						},
						{
							name: 'flex-end',
							description: 'Flex End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 3h2v18h-2V3zM3 15h14v6H3v-6z" />
								</g>
							),
						},
						{
							name: 'self-start',
							description: 'Self Start',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 4h6v16H4V4zm10 0h6v10h-6V4z" />
								</g>
							),
						},
						{
							name: 'self-end',
							description: 'Self End',
							icon: (
								<g transform="translate(2 2)">
									<path d="M14 4h6v16h-6V4zM4 10h6v10H4V10z" />
								</g>
							),
						},
						{
							name: 'anchor-center',
							description: 'Anchor Center',
							icon: (
								<g transform="translate(2 2)">
									<circle cx="12" cy="12" r="4" />
									<path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
								</g>
							),
						},
						{
							name: 'baseline',
							description: 'Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-4h2v4H6zm5-6h2v10h-2zm5 3h2v7h-2z" />
								</g>
							),
						},
						{
							name: 'first baseline',
							description: 'First Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-8h2v8H6zm5-4h2v12h-2zm5 2h2v10h-2z" />
								</g>
							),
						},
						{
							name: 'last baseline',
							description: 'Last Baseline',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 17h16v2H4zm2-12h2v12H6zm5 4h2v8h-2zm5 2h2v6h-2z" />
								</g>
							),
						},
						{
							name: 'safe center',
							description: 'Safe Center',
							icon: (
								<g transform="translate(2 2)">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'unsafe center',
							description: 'Unsafe Center',
							icon: (
								<g transform="translate(2 2)">
									<path d="M3 3h18v18H3z" />
									<path d="M7 12h10" />
								</g>
							),
						},
						{
							name: 'inherit',
							description: 'Inherit',
							icon: (
								<g transform="translate(2 2)">
									<path d="M4 21v-7h16v7M12 3v11" />
								</g>
							),
						},
						{
							name: 'initial',
							description: 'Initial',
							icon: (
								<g transform="translate(2 2)">
									<path d="M12 3v3M3 12h3m12 0h3M12 21v-3" />
								</g>
							),
						},
						{
							name: 'revert',
							description: 'Revert',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2z" />
								</g>
							),
						},
						{
							name: 'revert-layer',
							description: 'Revert Layer',
							icon: (
								<g transform="translate(2 2)">
									<path d="M20 8h-9v3l-5-4 5-4v3h11v8h-2zM4 19h16v2H4z" />
								</g>
							),
						},
						{
							name: 'unset',
							description: 'Unset',
							icon: (
								<g transform="translate(2 2)">
									<path d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" />
								</g>
							),
						},
					],
				}}
			/>
		</>
	);
}
