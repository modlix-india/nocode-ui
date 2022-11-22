import React from 'react';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { Link } from 'react-router-dom';
import { getTranslations } from './util/getTranslations';
import { Location } from './types';

export interface LinkProps extends React.ComponentPropsWithoutRef<'a'> {
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
	locationHistory: Array<Location | string>;
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
		locationHistory,
	} = props;
	const labelValue = getData(label, locationHistory);
	const linkPathValue = getData(linkPath, locationHistory);
	const targetValue = getData(target, locationHistory) || '_self';
	const externalButtonTargetVal =
		getData(externalButtonTarget, locationHistory) || '_blank';
	const showButtonVal = getData(showButton, locationHistory);

	return (
		<div className="comp compLinks ">
			<HelperComponent />
			<div className="linkDiv">
				<Link
					className="link"
					to={`${linkPathValue}`}
					target={targetValue}
				>
					{getTranslations(labelValue, translations)}
				</Link>
				{showButtonVal ? (
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
			['target', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['showButton', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			[
				'externalButtonTarget',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`),
			],
		]),
	);

export const link = LinkComponent;
