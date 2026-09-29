import React, { ReactNode } from 'react';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	PageDefinition,
} from '../../../../types/common';
import {
	ANIMATION_AXIS_PROP,
	ANIMATION_BASIC_PROPERTIES,
	ANIMATION_RANGE_END,
	ANIMATION_RANGE_START,
	ANIMATION_SCROLLER_PROP,
	ANIMATION_TIMELINE_PROP,
	NUM_OF_OBSERVATIONS,
	OBESERVATION_ENTERING_THRESHOLD,
	OBESERVATION_EXITING_THRESHOLD,
	OBESERVATION_PROP,
	TIMING_FUNCTION_EXTRA,
} from '../../../util/properties';
import { PageOperations } from '../../functions/PageOperations';
import PropertyValueEditor from './PropertyValueEditor';

interface AnimationValueEditorProps {
	value?: any;
	defaultValue?: boolean;
	onChange?: (v: any | undefined) => void;
	pageDefinition?: PageDefinition;
	onShowCodeEditor?: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	storePaths: Set<string>;
	pageOperations: PageOperations;
	appPath: string | undefined;
	propDef: ComponentPropertyDefinition;
}

export function AnimationValueEditor({
	value,
	defaultValue,
	onChange,
	pageDefinition,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	storePaths,
	pageOperations,
	appPath,
	propDef,
}: AnimationValueEditorProps) {
	let extraParam = undefined;

	if (
		value?.animationTimingFunction?.value === 'steps' ||
		value?.animationTimingFunction?.value === 'cubic-bezier'
	) {
		extraParam = (
			<div className="_eachProp">
				<div className="_propLabel">{TIMING_FUNCTION_EXTRA.displayName}:</div>
				<PropertyValueEditor
					appPath={appPath}
					pageDefinition={pageDefinition}
					propDef={TIMING_FUNCTION_EXTRA}
					value={value?.[TIMING_FUNCTION_EXTRA.name]}
					storePaths={storePaths}
					onChange={v =>
						onChange?.({ ...(value ?? {}), [TIMING_FUNCTION_EXTRA.name]: v })
					}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					pageOperations={pageOperations}
				/>
			</div>
		);
	}

	let observerSelection: ReactNode[] = [];

	if (propDef.editor == ComponentPropertyEditor.ANIMATIONOBSERVER) {
		observerSelection.push(
			<div className="_eachProp" key="observation">
				<div className="_propLabel">{OBESERVATION_PROP.displayName}:</div>
				<PropertyValueEditor
					appPath={appPath}
					pageDefinition={pageDefinition}
					propDef={OBESERVATION_PROP}
					value={value?.[OBESERVATION_PROP.name]}
					storePaths={storePaths}
					onChange={v => onChange?.({ ...(value ?? {}), [OBESERVATION_PROP.name]: v })}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					pageOperations={pageOperations}
				/>
			</div>,
		);

		let show = false;
		if (
			value?.observation?.value === 'entering' ||
			value?.observation?.value === 'entering-exiting'
		) {
			observerSelection.push(
				<div className="_eachProp" key="obEntering">
					<div className="_propLabel">{OBESERVATION_ENTERING_THRESHOLD.displayName}:</div>
					<PropertyValueEditor
						appPath={appPath}
						pageDefinition={pageDefinition}
						propDef={OBESERVATION_ENTERING_THRESHOLD}
						value={value?.[OBESERVATION_ENTERING_THRESHOLD.name]}
						storePaths={storePaths}
						onChange={v =>
							onChange?.({
								...(value ?? {}),
								[OBESERVATION_ENTERING_THRESHOLD.name]: v,
							})
						}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>,
			);
			show = true;
		}
		if (
			value?.observation?.value === 'exiting' ||
			value?.observation?.value === 'entering-exiting'
		) {
			observerSelection.push(
				<div className="_eachProp" key="obExiting">
					<div className="_propLabel">{OBESERVATION_EXITING_THRESHOLD.displayName}:</div>
					<PropertyValueEditor
						appPath={appPath}
						pageDefinition={pageDefinition}
						propDef={OBESERVATION_EXITING_THRESHOLD}
						value={value?.[OBESERVATION_EXITING_THRESHOLD.name]}
						storePaths={storePaths}
						onChange={v =>
							onChange?.({
								...(value ?? {}),
								[OBESERVATION_EXITING_THRESHOLD.name]: v,
							})
						}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>,
			);
			show = true;
		}

		if (show) {
			observerSelection.push(
				<div className="_eachProp" key="numberOfObservations">
					<div className="_propLabel">{NUM_OF_OBSERVATIONS.displayName}:</div>
					<PropertyValueEditor
						appPath={appPath}
						pageDefinition={pageDefinition}
						propDef={NUM_OF_OBSERVATIONS}
						value={value?.[NUM_OF_OBSERVATIONS.name]}
						storePaths={storePaths}
						onChange={v =>
							onChange?.({ ...(value ?? {}), [NUM_OF_OBSERVATIONS.name]: v })
						}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>,
			);
		}
	}

	/**
	 * The scroll-timeline fields, shown only once a timeline has been chosen.
	 *
	 * Hidden by default because `timeline` defaults to 'none' and the axis,
	 * scroller and range mean nothing then. Showing four inert fields on every
	 * animation on every component would make the common case worse to use.
	 */
	const timelineSelection: ReactNode[] = [];
	const field = (def: ComponentPropertyDefinition) => (
		<div className="_eachProp" key={def.name}>
			<div className="_propLabel">{def.displayName}:</div>
			<PropertyValueEditor
				appPath={appPath}
				pageDefinition={pageDefinition}
				propDef={def}
				value={value?.[def.name]}
				storePaths={storePaths}
				onChange={v => onChange?.({ ...(value ?? {}), [def.name]: v })}
				onShowCodeEditor={onShowCodeEditor}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
			/>
		</div>
	);

	timelineSelection.push(field(ANIMATION_TIMELINE_PROP as ComponentPropertyDefinition));

	const timelineMode = value?.[ANIMATION_TIMELINE_PROP.name]?.value;
	if (timelineMode && timelineMode !== 'none') {
		timelineSelection.push(field(ANIMATION_AXIS_PROP as ComponentPropertyDefinition));
		// view() is always measured against the element's own scrollport, so a
		// scroller choice there would be inert AND invalid in the emitted CSS.
		if (timelineMode === 'scroll') {
			timelineSelection.push(field(ANIMATION_SCROLLER_PROP as ComponentPropertyDefinition));
		}
		timelineSelection.push(field(ANIMATION_RANGE_START as ComponentPropertyDefinition));
		timelineSelection.push(field(ANIMATION_RANGE_END as ComponentPropertyDefinition));
	}

	return (
		<div className="_animationValueEditor">
			{ANIMATION_BASIC_PROPERTIES.map(propDef => (
				<div className="_eachProp" key={propDef.name}>
					<div className="_propLabel">{propDef.displayName}:</div>
					<PropertyValueEditor
						appPath={appPath}
						pageDefinition={pageDefinition}
						propDef={propDef}
						value={value?.[propDef.name]}
						storePaths={storePaths}
						onChange={v => onChange?.({ ...(value ?? {}), [propDef.name]: v })}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>
			))}
			{extraParam}
			{observerSelection}
			{timelineSelection}
		</div>
	);
}
