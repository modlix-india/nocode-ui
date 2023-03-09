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
import { checkFileUploadCriteria } from '../util/checkFileUploadCriteria';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';

function FileUpload(props: ComponentProps) {
	const [value, setValue] = useState<any>();
	const inputRef = useRef<any>();
	const [hover, setHover] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<any>('');
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: {},
		locationHistory,
		context,
	} = props;
	if (!bindingPath) throw new Error('Definition needs binding path');
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: {
			uploadViewType,
			uploadIcon,
			options,
			label,
			mainText,
			isMultiple,
			readOnly,
			maxFileSize,
			showFileList,
			uploadImmediately,
			onSelectEvent,
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
		errorMessage?.errors && !readOnly ? 'error' : ''
	} ${value !== undefined ? 'selected' : ''}`;

	const computedStyles = processComponentStylePseudoClasses(
		{ readOnly, hover },
		stylePropertiesWithPseudoStates,
	);

	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	const selectionEvent = uploadImmediately
		? props.pageDefinition.eventFunctions[onSelectEvent]
		: undefined;

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					if (value === undefined || value === null) {
						setValue(undefined);
						return;
					}
					setValue(value);
				},
				pageExtractor,
				bindingPathPath,
			),
		[bindingPathPath],
	);

	const handleClick = () => inputRef.current?.click();

	const onChangeFile = (event: any) => {
		if (!event.target.value?.length) return;
		const files = event.target.files;
		const isImgPassingCriteria = checkFileUploadCriteria(
			files,
			options?.split(','),
			maxFileSize,
		);
		setErrorMessage(isImgPassingCriteria);
		setData(bindingPathPath!, [...files], context?.pageName);
	};

	const handleDelete = (event: any, content: any) => {
		event.stopPropagation();
		if (value?.length == 0) return;
		value.splice(value.indexOf(content), 1);
		setData(bindingPathPath, value, context?.pageName);
	};

	React.useEffect(() => {
		if (value && selectionEvent) {
			(async () =>
				await runEvent(
					selectionEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
	}, [value]);

	const returnFileSize = (number: number) => {
		if (number < 1024) {
			return number + 'bytes';
		} else if (number > 1024 && number < 1048576) {
			return (number / 1024).toFixed(1) + 'KB';
		} else if (number > 1048576) {
			return (number / 1048576).toFixed(1) + 'MB';
		}
	};

	const comp = (
		<span className="mainText" style={computedStyles?.mainText ?? {}}>
			{mainText}
		</span>
	);

	const errComp = (
		<div
			title="error_message"
			style={computedStyles?.errorText ?? {}}
			className={`errors ${uploadViewType !== 'LARGE_VIEW' ? 'horizontal' : ''}`}
		>
			{errorMessage?.errors}
		</div>
	);

	const selectedComp = (each: any, index = 0) => {
		return (
			<div
				className="selectedDetails"
				key={index}
				style={computedStyles?.selectedFiles ?? {}}
			>
				<span>{each?.name}</span>
				<span>{`(${returnFileSize(each?.size)})`}</span>
				{uploadImmediately ? null : (
					<i
						className="fa fa-solid fa-close closeIcon"
						style={computedStyles?.closeIcon ?? {}}
						onClick={e => handleDelete(e, each)}
					/>
				)}
			</div>
		);
	};

	const uploadIconComp = (
		<i className={`uploadIcon ${uploadIcon}`} style={computedStyles?.icon} />
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
			{label}
		</label>
	);

	const fileContainer = (
		<div className="selectedFileContainer" style={computedStyles?.selectedFileContainer ?? {}}>
			{value?.map((each: any, index: any) => selectedComp(each, index))}
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
				{inputContainer}
				{uploadIconComp}
				{comp}
				{value?.length > 0 && showFileList ? fileContainer : labelComp}
			</div>
			{errorMessage?.errors ? errComp : null}
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
				{inputContainer}
				<button
					className="inputContainer"
					style={computedStyles?.inputStyles ?? {}}
					onClick={handleClick}
				>
					{!!uploadIcon ? uploadIconComp : null}
					{comp}
				</button>
				{labelComp}
			</div>
			{errorMessage?.errors ? errComp : null}
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
	name: 'FileUpload',
	displayName: 'FileUpload',
	description: 'FileUpload Component',
	component: FileUpload,
	styleComponent: FileUploadStyles,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
};

export default component;
