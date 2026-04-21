import React from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

interface CraftCardProps {
	title: string;
	subtitle?: string;
	onClick: () => void;
	definition: ComponentDefinition;
	styleProperties?: any;
}

export function CraftCard({
	title,
	subtitle,
	onClick,
	definition,
	styleProperties,
}: Readonly<CraftCardProps>) {
	return (
		<button
			type="button"
			className="_craftCard"
			onClick={onClick}
			style={styleProperties?.craftCard ?? {}}
		>
			<SubHelperComponent definition={definition} subComponentName="craftCard" />
			<i className="fa fa-file-lines _craftCardIcon" />
			<div className="_craftCardText">
				<span className="_craftCardTitle">{title}</span>
				{subtitle && <span className="_craftCardSubtitle">{subtitle}</span>}
			</div>
			<i className="fa fa-chevron-right _craftCardChevron" />
		</button>
	);
}
