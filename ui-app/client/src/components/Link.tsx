import React from 'react';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { Link as RouterLink } from 'react-router-dom';
import { getTranslations } from './util/getTranslations';

interface LinkProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			linkPath: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			label: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			target: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			showButton: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			externalButtonTarget: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
	};
	pageDefinition: {
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
}

function Link(props: LinkProps) {
	const {
		definition: {
			properties: { linkPath, label, target, showButton, externalButtonTarget },
		},
		pageDefinition: { translations },
		definition,
	} = props;
	const labelValue = getData(label);
	const linkPathValue = getData(linkPath);
	const targetValue = getData(target) || '_self';
	const externalButtonTargetVal = getData(externalButtonTarget) || '_blank';
	const showButtonVal = getData(showButton);

	return (
		<div className="comp compLinks ">
			<HelperComponent definition={definition} />
			<div className="linkDiv">
				<RouterLink className="link" to={`${linkPathValue}`} target={targetValue}>
					{getTranslations(labelValue, translations)}
				</RouterLink>
				{showButtonVal ? (
					<RouterLink to={`${linkPathValue}`} target={externalButtonTargetVal} className="secondLink">
						<i className="fa-solid fa-up-right-from-square"></i>
					</RouterLink>
				) : null}
			</div>
		</div>
	);
}

Link.propertiesSchema = Schema.ofObject('Link')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['linkPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['target', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['showButton', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['externalButtonTarget', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default Link;
