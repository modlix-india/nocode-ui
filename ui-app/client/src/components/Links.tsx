import React from 'react';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { Link, useNavigate } from 'react-router-dom';

export interface LinkProps extends React.ComponentPropsWithoutRef<'span'> {
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

export function LinkComponent(props: LinkProps) {
	const {
		definition: {
			properties: {
				linkPath,
				label,
				target,
				showButton,
				externalButtonTarget,
			},
		},
		pageDefinition: { translations },
		...rest
	} = props;
	const labelValue = getData(label);
	const linkPathValue = getData(linkPath);
	const targetValue = getData(target);
	const externalButtonTargetVal = getData(externalButtonTarget);
	const showButtonVal = getData(showButton);

	console.log(targetValue);
	const tValue = targetValue ? targetValue : '_self';
	const navigate = useNavigate();
	console.log(externalButtonTargetVal);
	return (
		<div className="comp compTextBox ">
			<HelperComponent />
			<div className="linkDiv">
				<Link className="link" to={`${linkPathValue}`} target={tValue}>
					{labelValue}
				</Link>
				{showButton ? (
					<Link
						to={`${linkPathValue}`}
						target={externalButtonTargetVal}
						className="secondLink"
					>
						<i className="fa-solid fa-up-right-from-square"></i>
					</Link>
				) : null}
			</div>
		</div>
	);
}

LinkComponent.propertiesSchema = Schema.ofObject('Link')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['linkPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const link = LinkComponent;
