import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';
import { validate } from '../../util/validationProcessor';
import { flattenUUID } from '../util/uuid';
import { isNullValue } from '@fincity/kirun-js';
import { returnFileSize } from '../util/getFileSize';
import { SubHelperComponent } from '../SubHelperComponent';

function FileUpload(props: ComponentProps) {
	const [fileValue, setFileValue] = useState<any>();
	const inputRef = useRef<any>();
	const [hover, setHover] = useState<boolean>(false);
	const [validationMessages, setValidationMessages] = useState<Array<string>>([]);
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: {},
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: {
			uploadViewType,
			uploadIcon,
			options,
			subText,
			mainText,
			isMultiple,
			readOnly,
			maxFileSize,
			showFileList,
			onSelectEvent,
			validation,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const className = `uploadContainer ${readOnly ? 'disabled' : ''} ${
		validationMessages.length && !readOnly ? 'error' : ''
	} ${fileValue !== undefined ? 'selected' : ''}`;

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ disabled: readOnly, hover },
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const uploadImmediatelyEvent = onSelectEvent
		? props.pageDefinition.eventFunctions[onSelectEvent]
		: undefined;
	useEffect(() => {
		const msgs = validation?.length
			? validate(
					props.definition,
					props.pageDefinition,
					validation,
					fileValue,
					locationHistory,
					pageExtractor,
			  )
			: [];
		if (msgs.length) {
			setValidationMessages(msgs);
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				msgs.length ? msgs : undefined,
				context.pageName,
				true,
			);
		}
		if (!msgs.length && fileValue && uploadImmediatelyEvent) {
			(async () =>
				await runEvent(
					uploadImmediatelyEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}

		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [fileValue, validation]);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setFileValue(value);
					return;
				}
				isMultiple && !Array.isArray(value) ? setFileValue([value]) : setFileValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleClick = () => inputRef.current?.click();

	const onChangeFile = (event: any) => {
		if (!event.target.value?.length || !bindingPathPath) return;
		const files = event.target.files;
		setData(bindingPathPath, isMultiple ? [...files] : files[0], context?.pageName);
	};

	const handleDelete = (event: any, content: any) => {
		event.stopPropagation();
		let deleted: any;
		if (isMultiple) {
			deleted = fileValue.slice();
			deleted.splice(fileValue.indexOf(content), 1);
		}
		setData(bindingPathPath!, deleted, context?.pageName);
	};

	const comp = (
		<span className="mainText" style={computedStyles?.mainText ?? {}}>
			<SubHelperComponent definition={props.definition} subComponentName="mainText" />
			{mainText}
		</span>
	);

	const validationMessagesComp =
		validationMessages?.length && (fileValue || context.showValidationMessages) ? (
			<div className="_validationMessages">
				<SubHelperComponent
					definition={props.definition}
					subComponentName="validationMessagesContainer"
				/>
				{validationMessages.map(msg => (
					<div className="_eachvalidationMessage" key={msg}>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="validationMessage"
						/>
						{msg}
					</div>
				))}
			</div>
		) : undefined;

	const selectedComp = (each: any, index = 0) => {
		return (
			<div
				className="selectedDetails"
				key={index}
				style={computedStyles?.selectedFiles ?? {}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="selectedFiles"
				/>
				<span>{each?.name}</span>
				<span>{`(${returnFileSize(each?.size)})`}</span>
				{uploadImmediatelyEvent ? null : (
					<i
						className="fa fa-solid fa-close closeIcon"
						style={computedStyles?.closeIcon ?? {}}
						onClick={e => handleDelete(e, each)}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="closeIcon"
						/>
					</i>
				)}
			</div>
		);
	};

	const uploadIconComp = (
		<i className={`uploadIcon ${uploadIcon}`} style={computedStyles?.icon}>
			<SubHelperComponent definition={props.definition} subComponentName="icon" />
		</i>
	);

	const inputContainer = (
		<input
			type="file"
			ref={inputRef}
			onChange={onChangeFile}
			className="hidden"
			accept={options}
			multiple={isMultiple}
			disabled={readOnly}
			max={maxFileSize}
			onClick={e => (e.currentTarget.value = '')}
		/>
	);

	const labelComp = (
		<label className="labelText" style={computedStyles?.label ?? {}}>
			<SubHelperComponent definition={props.definition} subComponentName="label" />
			{subText}
		</label>
	);

	const fileContainer = (
		<div className="selectedFileContainer" style={computedStyles?.selectedFileContainer ?? {}}>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="selectedFileContainer"
			/>
			{(isMultiple ? fileValue : [fileValue])?.map((each: any, index: any) =>
				selectedComp(each, index),
			)}
		</div>
	);
	const largeView = (
		<>
			<div
				className={`${className}`}
				onClick={handleClick}
				style={computedStyles?.uploadContainer ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="uploadContainer"
				/>
				{inputContainer}
				{uploadIconComp}
				{comp}
				{((Array.isArray(fileValue) && fileValue.length > 0) ||
					fileValue?.constructor?.name === 'File') &&
				showFileList
					? fileContainer
					: labelComp}
			</div>
			{validationMessagesComp}
		</>
	);
	const smallView = (
		<>
			<div
				className={`${className} horizontal`}
				style={computedStyles?.uploadContainer ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="uploadContainer"
				/>
				{inputContainer}
				<button
					className="inputContainer"
					style={computedStyles?.buttonStyles ?? {}}
					onClick={handleClick}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="buttonStyles"
					/>
					{!!uploadIcon ? uploadIconComp : null}
					{comp}
				</button>
				{labelComp}
			</div>
			{showFileList ? fileContainer : null}
		</>
	);

	return (
		<div className="comp compFileUpload" style={computedStyles?.comp ?? {}}>
			<HelperComponent definition={definition} />
			{uploadViewType === 'LARGE_VIEW' ? largeView : smallView}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-upload',
	name: 'FileUpload',
	displayName: 'FileUpload',
	description: 'FileUpload Component',
	component: FileUpload,
	styleComponent: FileUploadStyles,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'File binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'FileUpload',
		type: 'FileUpload',
		properties: {},
	},
};

export default component;
