import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { checkFileUploadCriteria } from '../util/checkFileUploadCriteria';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';

function FIleUpload(props: ComponentProps) {
	const [value, setValue] = useState<any>();
	const [selected, setSelected] = useState<any>();
	const [errorMessage, setErrorMessage] = useState<any>('');
	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;
	if (!bindingPath) throw new Error('Definition needs binding path');
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: {
			uploadFileType,
			uploadIcon,
			options,
			label,
			mainText,
			multiple,
			readOnly,
			maxFileSize,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const computedStyles = processComponentStylePseudoClasses(
		{ readOnly },
		stylePropertiesWithPseudoStates,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPathPath) return;
		const initValue = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);
		if (isNullValue(initValue)) {
			setData(bindingPathPath, initValue, context.pageName);
		}
		setValue(initValue ?? '');
	}, [bindingPathPath]);

	useEffect(
		() =>
			bindingPathPath
				? addListenerAndCallImmediately(
						(_, value) => {
							if (value === undefined || value === null) {
								setValue(undefined);
								return;
							}
							setValue(value);
						},
						pageExtractor,
						bindingPathPath,
				  )
				: undefined,
		[bindingPathPath],
	);

	const handleClick = () => {
		document.getElementsByTagName('input')?.item(0)?.click();
	};

	const onChangeFile = async (event: any) => {
		if (!event.target.value?.length) return;
		const formData = new FormData();
		const files = event.target.files;
		const fileTypes = options?.split(',');
		const isImgPassingCriteria = await checkFileUploadCriteria(files, fileTypes, maxFileSize);
		setErrorMessage(isImgPassingCriteria);
		setData(bindingPathPath!, files, context?.pageName);
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
			className={`errors ${uploadFileType !== 'LARGE_VIEW' ? 'horizontal' : ''}`}
		>
			{errorMessage?.fileType?.errors ||
				errorMessage?.fileSize?.errors ||
				errorMessage?.fileResolution?.errors}
		</div>
	);

	const selectedComp = (each: any, index = 0) => {
		return (
			<div className="selectedDetails" key={index}>
				<span style={computedStyles?.selectedFiles ?? {}}>{each?.name}</span>
			</div>
		);
	};

	return (
		<div className="comp compFileUpload" style={computedStyles?.comp ?? {}}>
			<HelperComponent definition={definition} />
			<div
				className={`uploadContainer ${readOnly ? 'disabled' : ''} ${
					uploadFileType === 'SMALL_VIEW'
						? 'horizontal'
						: uploadFileType === 'MID_VIEW'
						? 'fixed'
						: ''
				} ${errorMessage?.status?.value === 'fail' && !readOnly ? 'error' : ''} ${
					value !== undefined ? 'selected' : ''
				}`}
				onClick={uploadFileType === 'SMALL_VIEW' ? undefined : () => handleClick()}
				style={computedStyles?.uploadContainer ?? {}}
			>
				{uploadFileType === 'SMALL_VIEW' ? null : (
					<i className={`uploadIcon ${uploadIcon}`} style={computedStyles?.icon} />
				)}
				<input
					type="file"
					onChange={onChangeFile}
					className="hidden"
					accept={options}
					multiple={multiple}
					disabled={readOnly}
				/>
				{uploadFileType === 'SMALL_VIEW' ? (
					<button
						className="inputContainer"
						style={computedStyles?.inputStyles ?? {}}
						onClick={handleClick}
					>
						{!!uploadIcon ? (
							<i
								className={`uploadIcon ${uploadIcon}`}
								style={computedStyles?.icon}
							/>
						) : null}
						{comp}
					</button>
				) : null}
				{uploadFileType === 'SMALL_VIEW' ? null : comp}
				{!value ? (
					uploadFileType === 'MID_VIEW' ? null : (
						<label className="labelText" style={computedStyles?.label ?? {}}>
							{label}
						</label>
					)
				) : null}
				<div className="selectedMain" style={computedStyles?.selectedMain ?? {}}>
					{value != undefined
						? [...value]?.map((each: any, index: any) => selectedComp(each, index))
						: null}
				</div>
			</div>
			{errorMessage ? errComp : null}
		</div>
	);
}

const component: Component = {
	name: 'FileUpload',
	displayName: 'FileUpload',
	description: 'FileUpload Component',
	component: FIleUpload,
	styleComponent: FileUploadStyles,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
};

export default component;
