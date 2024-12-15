import React, { KeyboardEvent } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tagsProperties';
import TagsStyle from './TagsStyles';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './TagsStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Tags(props: Readonly<ComponentProps>) {
	const [hover, setHover] = React.useState('');
	const {
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: {
			icon,
			closeButton,
			closeEvent,
			readOnly,
			datatype,
			uniqueKeyType,
			labelKeyType,
			labelKey,
			uniqueKey,
			hasInputBox,
			delimitter,
			placeHolder,
			label,
		} = {},
		key,
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const [value, setvalue] = React.useState<any>();
	const [inputData, setInputData] = React.useState<string>('');
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				setvalue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);
	const showInputBox = hasInputBox && datatype == 'LIST_OF_STRINGS';
	const renderData = React.useMemo(
		() =>
			getRenderData(
				value,
				datatype,
				uniqueKeyType,
				uniqueKey,
				'OBJECT',
				'',
				labelKeyType,
				labelKey,
			),
		[value, datatype, uniqueKeyType, uniqueKey, labelKeyType, labelKey],
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const resolvedStylesWithPseudo = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === delimitter) {
			setData(
				bindingPathPath!,
				[
					...(Array.isArray(value) ? value : []),
					...(inputData
						?.trim()
						?.split(delimitter)
						?.filter(e => !!e) ?? []),
				],
				context.pageName,
			);
			setInputData('');
		}
	};

	const onCloseEvent = closeEvent ? props.pageDefinition.eventFunctions?.[closeEvent] : undefined;

	const handleClose = (originalKey: string | number) => {
		if ((datatype.startsWith('LIST') && Array.isArray(value)) || showInputBox) {
			const data = value.slice();
			data.splice(originalKey as number, 1);
			setData(bindingPathPath!, data, context.pageName);
		} else {
			const data = { ...value };
			delete data[originalKey];
			setData(bindingPathPath!, data, context.pageName);
		}
		if (!readOnly && onCloseEvent) {
			(async () =>
				await runEvent(
					onCloseEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
	};
	return (
		<div className="comp compTags">
			<HelperComponent context={props.context} definition={props.definition} />
			<div className="label" style={resolvedStyles.titleLabel ?? {}}>
				<SubHelperComponent definition={props.definition} subComponentName="titleLabel" />
				{label}
			</div>
			<div
				className={hasInputBox ? 'containerWithInput' : ''}
				style={resolvedStyles.outerContainerWithInputBox ?? {}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="outerContainerWithInputBox"
				/>
				{hasInputBox ? (
					<>
						<input
							className="input"
							type="text"
							value={inputData}
							onKeyUp={handleKeyUp}
							onChange={e => setInputData(e.target.value)}
							placeholder={placeHolder}
							style={resolvedStyles.inputBox ?? {}}
						/>
						<SubHelperComponent
							style={resolvedStyles.inputBox ?? {}}
							className="input"
							definition={definition}
							subComponentName="inputBox"
						></SubHelperComponent>
					</>
				) : null}

				<div
					className={`${hasInputBox ? 'tagcontainerWithInput' : 'tagContainer'} `}
					style={resolvedStyles.tagContainer ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="tagContainer"
					/>
					{renderData?.map(e => (
						<div
							onMouseEnter={
								stylePropertiesWithPseudoStates?.hover
									? () => setHover(e?.key)
									: undefined
							}
							onMouseLeave={
								stylePropertiesWithPseudoStates?.hover
									? () => setHover('')
									: undefined
							}
							className="container"
							style={
								(hover === e?.key ? resolvedStylesWithPseudo : resolvedStyles)
									.container ?? {}
							}
							key={e?.key}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="container"
							/>
							{icon && (
								<i
									className={`${icon} iconCss`}
									style={{
										...((hover === e?.key
											? resolvedStylesWithPseudo
											: resolvedStyles
										).icon ?? {}),
									}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="icon"
									/>
								</i>
							)}
							<div
								title={e?.label}
								style={
									(hover === e?.key ? resolvedStylesWithPseudo : resolvedStyles)
										.tagText ?? {}
								}
								className="text"
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="tagText"
								/>
								{e?.label}
							</div>
							{closeButton ? (
								<i
									tabIndex={0}
									style={
										(hover === e?.key
											? resolvedStylesWithPseudo
											: resolvedStyles
										).tagCloseIcon ?? {}
									}
									className="fa fa-solid fa-xmark closeButton"
									onClick={() => handleClose(e?.originalObjectKey!)}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="tagCloseIcon"
									/>
								</i>
							) : (
								''
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Tags',
	displayName: 'Tags',
	description: 'Tags Component',
	component: Tags,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TagsStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Tags',
		name: 'Tags',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 29">
					<path
						className="_tagIcon3"
						d="M0.0543799 22.6386C-0.172639 23.5162 0.331737 24.419 1.18348 24.6557L6.43726 26.1074L2.79495 12.0859L0.0543799 22.6386Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tagIcon2"
						d="M8.84657 26.9103C9.07592 27.7883 9.95033 28.3097 10.8014 28.0752L16.6716 26.4515L5.82031 15.2578L8.84657 26.9103Z"
						fill="#EDEAEA"
					/>
					<path
						className="_tagIcon"
						d="M29.5334 13.326L17.0777 0.474959C16.7837 0.171618 16.385 0.00137578 15.9693 0.00103186L7.46155 0C6.28611 0 5.33236 0.983622 5.33236 2.19664L5.33203 10.9753C5.33203 11.4042 5.49704 11.8159 5.79107 12.1192L18.2475 24.9699C18.5595 25.2918 18.9679 25.4524 19.3762 25.4524C19.7846 25.4524 20.193 25.2915 20.505 24.9699L29.5334 15.654C30.1565 15.0109 30.1565 13.9688 29.5334 13.326ZM9.94376 6.07576C9.02334 6.07576 8.27695 5.30571 8.27695 4.35614C8.27695 3.40657 9.02334 2.63652 9.94376 2.63652C10.8642 2.63652 11.6106 3.40657 11.6106 4.35614C11.6106 5.30606 10.8642 6.07576 9.94376 6.07576Z"
						fill="#E442E2"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9286"
							x1="3.21863"
							y1="12.0859"
							x2="3.21863"
							y2="26.1074"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9286"
							x1="11.2459"
							y1="15.2578"
							x2="11.2459"
							y2="28.1313"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9286"
							x1="17.6664"
							y1="0"
							x2="17.6664"
							y2="25.4524"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FF79FD" />
							<stop offset="1" stopColor="#E442E2" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'outerContainerWithInputBox',
			displayName: 'Outer Container With Input Box',
			description: 'Outer Container With Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'inputBox',
			displayName: 'Input Box',
			description: 'Input Box',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagContainer',
			displayName: 'Tag Container',
			description: 'Tag Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagText',
			displayName: 'Tag Text',
			description: 'Tag Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tagCloseIcon',
			displayName: 'Tag Close Icon',
			description: 'Tag Close Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'titleLabel',
			displayName: 'Title Label',
			description: 'Title Label',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
