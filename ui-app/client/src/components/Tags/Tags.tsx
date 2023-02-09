import React from 'react';
import {
	addListener,
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
	if (!bindingPath) throw new Error('Binding path is required for definition');
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const [value, setvalue] = React.useState<any>(
		getDataFromPath(bindingPathPath, locationHistory, pageExtractor),
	);
	React.useEffect(() => {
		return addListener(
			(_, value) => {
				setvalue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);
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
		{ hover: false, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const resolvedStylesWithPseudo = processComponentStylePseudoClasses(
		{ hover: true, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const onCloseEvent = closeEvent ? props.pageDefinition.eventFunctions[closeEvent] : undefined;

	const handleClose = (originalKey: string | number) => {
		if (datatype.startsWith('LIST') && Array.isArray(value)) {
			const data = value.slice();
			data.splice(originalKey as number, 1);
			setData(bindingPathPath, data, context.pageName);
		} else {
			const data = { ...value };
			delete data[originalKey];
			setData(bindingPathPath, data, context.pageName);
		}
		if (!readOnly) {
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
			<div className="tagContainer" style={resolvedStyles.tagContainer ?? {}}>
				{renderData?.map(e => (
					<div
						onMouseEnter={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(e?.key)
								: undefined
						}
						onMouseLeave={
							stylePropertiesWithPseudoStates?.hover ? () => setHover('') : undefined
						}
						className="container"
						style={
							(hover === e?.key ? resolvedStylesWithPseudo : resolvedStyles)
								.container ?? {}
						}
						key={e?.key}
					>
						{icon && (
							<i
								className={`${icon} iconCss`}
								style={
									{
										...((hover === e?.key
											? resolvedStylesWithPseudo
											: resolvedStyles
										).tagIcon ?? {}),
										...((hover === e?.key
											? resolvedStylesWithPseudo
											: resolvedStyles
										).icon ?? {}),
									} ?? {}
								}
							></i>
						)}
						<div
							style={
								(hover === e?.key ? resolvedStylesWithPseudo : resolvedStyles)
									.tagText ?? {}
							}
							className="text"
						>
							{e?.label}
						</div>
						{closeButton ? (
							<i
								tabIndex={0}
								style={
									(hover === e?.key ? resolvedStylesWithPseudo : resolvedStyles)
										.tagCloseIcon ?? {}
								}
								className="fa fa-solid fa-xmark closeButton"
								onClick={() => handleClose(e?.originalObjectKey!)}
							></i>
						) : (
							''
						)}
					</div>
				))}
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
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
};

export default component;
