import React from 'react';
import { addListener, getPathFromLocation, PageStoreExtractor } from '../../context/StoreContext';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tagsProperties';
import TagsStyle from './TagsStyles';

function Tags(props: ComponentProps) {
	const [value, setvalue] = React.useState('');
	const [hover, setHover] = React.useState(false);
	const {
		definition: { bindingPath },
		definition,
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: { icon, label, closeButton, closeEvent, onClick, readOnly, readOnlyonly } = {},
		key,
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	console.log(onClick + 'akhil');
	console.log(readOnlyonly + 'alli');
	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);
	const onCLickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

	const closeEventEvent = closeEvent
		? props.pageDefinition.eventFunctions[closeEvent]
		: undefined;

	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const handleClick = () => {
		if (!readOnly) {
			(async () => await runEvent(onCLickEvent, key, props.context.pageName))();
		}
	};
	const handleClose = (e: any) => {
		e.stopPropagation();
		if (!readOnly) {
			(async () => await runEvent(closeEventEvent, key, props.context.pageName))();
		}
	};
	React.useEffect(() => {
		return addListener(
			(_, value) => {
				setvalue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	return (
		<div className="comp compTags">
			<HelperComponent definition={props.definition} />
			<div
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				className="container"
				style={resolvedStyles.container ?? {}}
				onClick={handleClick}
			>
				{icon && (
					<i
						className={`${icon} iconCss`}
						style={
							{
								...(resolvedStyles.tagIcon ?? {}),
								...(resolvedStyles.icon ?? {}),
							} ?? {}
						}
					></i>
				)}
				<div style={resolvedStyles.tagText ?? {}} className="text">
					{bindingPathPath ? value : label}
				</div>
				{closeButton ? (
					<i
						style={resolvedStyles.tagCloseIcon ?? {}}
						className="fa-solid fa-xmark closeButton"
						onClick={handleClose}
					></i>
				) : (
					''
				)}
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
};

export default component;
