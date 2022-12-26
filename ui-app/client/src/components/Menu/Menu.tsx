import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	ComponentProps,
	ComponentPropertyDefinition,
	ComponentProperty,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './menuProperties';
import { HelperComponent } from '../HelperComponent';
import { renderChildren } from '../util/renderChildren';
import { getTranslations } from '../util/getTranslations';
import MenuStyle from './MenuStyle';

function Menu(props: ComponentProps) {
	const [value, setValue] = React.useState([]);

	// let {
	// 	key,
	// 	properties: { label, onClick, icon } = {},
	// 	stylePropertiesWithPseudoStates,
	// } = useDefinition(props.definition, propertiesDefinition, stylePropertiesDefinition, props.locationHistory, pageExtractor);

	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {definition:{bindingPath}} = props;

	const {
		
		key,
		properties: { label, onClick, icon, isMenuOpen, linkPath, target } = {},
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);

	// const {
	// 	definition: {
	// 		bindingPath,
	// 		properties: {
	// 			dataBinding,
	// 			linkPath,
	// 			label,
	// 			target,
	// 			isMenuOpen,
	// 			showButton,
	// 			externalButtonTarget,
	// 		},
	// 	},
	// 	pageDefinition: { translations },
	// 	// definition:{ bindingPath },
	// 	locationHistory,
	// 	context,
	// } = props;

	//  const bindingPathPath = getPathFromLocation(bindingPath, props.locationHistory);

	React.useEffect(() => {
		setData();
		addListener(
			(_, value) => {
				setValue(value ?? 'Abc');
			},
			pageExtractor,
			getPathFromLocation(bindingPath, props.locationHistory);
		);
		console.log('menu data ', dataBinding, value);
	}, []);

	return (
		<div className="comp compMenu">
			<HelperComponent definition={props.definition} />
			<div className="menuContainer">
				<img src="https://fincity-public.s3.ap-south-1.amazonaws.com/logo/Fincity_logo_svg.svg" />
				{/* {value.map((_, index) =>
				renderChildren(pageDefinition, firstchild, context, [
					...locationHistory,
					updateLocationForChild(bindingPath!, index, locationHistory),
				]),
			)} */}
				{value.map((each, index) => {
					console.log('each ', each);
					return <div>{each.name}</div>;
				})}
				{/* <div className="menuDiv">
					<RouterLink className="link" to={`${linkPathValue}`} target={targetValue}>
						{getTranslations(labelValue, translations)}
					</RouterLink>
					{showButtonVal ? (
						<RouterLink
							to={`${linkPathValue}`}
							target={externalButtonTargetVal}
							className="secondLink"
						>
							<i className="fa-solid fa-up-right-from-square"></i>
						</RouterLink>
					) : null}
				</div> */}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: MenuStyle,
};

export default component;
