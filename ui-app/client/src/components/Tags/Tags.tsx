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

function Tags(props: ComponentProps) {
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
						.filter(e => !!e) ?? []),
				] ?? [],
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
									style={
										{
											...((hover === e?.key
												? resolvedStylesWithPseudo
												: resolvedStyles
											).icon ?? {}),
										} ?? {}
									}
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M0.841382 17.9027C0.671885 18.558 1.04846 19.2321 1.68439 19.4087L5.60696 20.4926L2.88754 10.0239L0.841382 17.9027Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M7.40595 21.0886C7.57719 21.7442 8.23004 22.1335 8.86547 21.9584L13.2482 20.7461L5.14648 12.3887L7.40595 21.0886Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M22.8505 10.9495L13.5508 1.35461C13.3313 1.12813 13.0336 1.00103 12.7232 1.00077L6.37119 1C5.49359 1 4.7815 1.73439 4.7815 2.64006L4.78125 9.19438C4.78125 9.51458 4.90445 9.82195 5.12398 10.0484L14.4242 19.643C14.6571 19.8834 14.962 20.0033 15.2669 20.0033C15.5718 20.0033 15.8767 19.8831 16.1097 19.643L22.8505 12.6876C23.3157 12.2074 23.3157 11.4294 22.8505 10.9495ZM8.22446 5.53628C7.53726 5.53628 6.97998 4.96135 6.97998 4.25238C6.97998 3.54341 7.53726 2.96848 8.22446 2.96848C8.91165 2.96848 9.46893 3.54341 9.46893 4.25238C9.46893 4.96161 8.91165 5.53628 8.22446 5.53628Z"
						fill="currentColor"
					/>
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
