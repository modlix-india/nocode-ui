import { TokenValueExtractor } from '@fincity/kirun-js';
import React from 'react';
import { setData } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { runEvent } from '../util/runEvent';
import { propertiesDefinition } from './pageEditorProperties';

interface TopBarProps {
	theme: string;
	personalizationPath: string | undefined;
	logo: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
}

export default function TopBar({
	theme,
	personalizationPath,
	logo,
	onChangePersonalization,
	onSave,
}: TopBarProps) {
	const svgLogo = logo ? <img className="_logo" src={logo} /> : undefined;

	return (
		<div className="_topBarGrid">
			<div className="_topLeftBarGrid">{svgLogo}</div>
			<div className="_topRightBarGrid">
				<select
					value={theme}
					onChange={e => onChangePersonalization('theme', e.target.value)}
				>
					{propertiesDefinition
						.find(e => e.name === 'theme')
						?.enumValues?.map(e => (
							<option key={e.name} value={e.name} title={e.description}>
								{e.displayName}
							</option>
						))}
				</select>
				<button onClick={onSave}>Save</button>
			</div>
		</div>
	);
}
