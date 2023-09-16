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
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tagsProperties';
import TagsStyle from './TagsStyles';
import { SubHelperComponent } from '../SubHelperComponent';
import { styleDefaults } from './TagsStyleProperties';

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

	const onCloseEvent = closeEvent ? props.pageDefinition.eventFunctions[closeEvent] : undefined;

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
			<HelperComponent definition={props.definition} />
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
	icon: 'fa-solid fa-tags',
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
};

export default component;
