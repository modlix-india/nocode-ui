import React, { ReactNode } from 'react';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	PageDefinition,
} from '../../../../types/common';
import {
	ANIMATION_BASIC_PROPERTIES,
	OBESERVATION_ENTERING_THRESHOLD,
	OBESERVATION_EXITING_THRESHOLD,
	OBESERVATION_PROP,
	TIMING_FUNCTION_EXTRA,
} from '../../../util/properties';
import PageOperations from '../../functions/PageOperations';
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
		}
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
		</div>
	);
}
