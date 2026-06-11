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
	const prevBlockCount = useRef(0);
	const craftIdRef = useRef(craft.id);
	// stick = user at/near bottom. written only on wheel/touch (human-only
	// events) — smooth glide fires scroll events but never these, can't unstick itself.
	const stickToBottomRef = useRef(true);

	const noteUserScroll = () => {
		// rAF: wheel fires before scrollTop updates
		requestAnimationFrame(() => {
			const el = bodyRef.current;
			if (!el) return;
			stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
		});
	};

	// scroll when: sticking · new block appended · craft switched
	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		const isNewCraft = craftIdRef.current !== craft.id;
		craftIdRef.current = craft.id;
		const blocksGrew = !isNewCraft && craft.blocks.length > prevBlockCount.current;
		prevBlockCount.current = craft.blocks.length;

		if (isNewCraft || blocksGrew || stickToBottomRef.current) {
			const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
			// glide big jumps; snap small growth (fast deltas can't stack glides) + craft switch
			const behavior = !isNewCraft && gap > 150 ? 'smooth' : 'auto';
			el.scrollTo({ top: el.scrollHeight, behavior });
			stickToBottomRef.current = true;
		}
	}, [craft.id, craft.blocks]);

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
			<div
				className="_craftPanelBody"
				ref={bodyRef}
				onWheel={noteUserScroll}
				onTouchMove={noteUserScroll}
			>
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
