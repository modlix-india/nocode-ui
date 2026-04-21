import React, { useEffect, useRef } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CraftRenderer } from './CraftRenderer';

interface CraftData {
	id: string;
	title: string;
	blocks: Array<{ type: string; [key: string]: any }>;
	message_id?: string;
}

interface CraftPanelProps {
	craft: CraftData;
	onClose: () => void;
	definition: ComponentDefinition;
	styleProperties?: any;
}

export function CraftPanel({
	craft,
	onClose,
	definition,
	styleProperties,
}: Readonly<CraftPanelProps>) {
	const bodyRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom as content streams in
	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		// Only auto-scroll if user is near the bottom (within 100px)
		const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
		if (isNearBottom) {
			el.scrollTop = el.scrollHeight;
		}
	}, [craft.blocks]);

	return (
		<div className="_craftPanel" style={styleProperties?.craftPanel ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="craftPanel" />
			<div
				className="_craftPanelHeader"
				style={styleProperties?.craftPanelHeader ?? {}}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="craftPanelHeader"
				/>
				<span className="_craftPanelTitle">{craft.title}</span>
				<button
					type="button"
					className="_craftPanelClose"
					onClick={onClose}
					title="Close"
				>
					<i className="fa fa-xmark" />
				</button>
			</div>
			<div className="_craftPanelBody" ref={bodyRef}>
				<CraftRenderer
					blocks={craft.blocks}
					definition={definition}
					styleProperties={styleProperties}
				/>
			</div>
		</div>
	);
}

export type { CraftData };
