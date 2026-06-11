import React, { useEffect, useRef, useState } from 'react';
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
	const craftIdRef = useRef<string | null>(null);
	// at bottom → follow new content; scrolled up (any way) → never yank
	const stickRef = useRef(true);
	// pill shown ⇔ content below; no pill = you're at the end
	const [belowFold, setBelowFold] = useState(false);

	const measure = () => {
		const el = bodyRef.current;
		if (!el) return;
		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
		stickRef.current = atBottom;
		setBelowFold(!atBottom);
	};

	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		const isNewCraft = craftIdRef.current !== craft.id;
		craftIdRef.current = craft.id;
		// open/switch lands at end; sticking follows new content
		if (isNewCraft || stickRef.current) el.scrollTop = el.scrollHeight;
		measure();
	}, [craft.id, craft.blocks]);

	const jumpToBottom = () => {
		// stick resumes via onScroll when the glide hits bottom
		bodyRef.current?.scrollTo({
			top: bodyRef.current.scrollHeight,
			behavior: 'smooth',
		});
	};

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
			<div className="_craftPanelBody" ref={bodyRef} onScroll={measure}>
				<CraftRenderer
					blocks={craft.blocks}
					definition={definition}
					styleProperties={styleProperties}
				/>
			</div>
			{belowFold && (
				<button
					type="button"
					className="_craftJumpDown"
					onClick={jumpToBottom}
					title="Jump to latest"
				>
					<i className="fa fa-chevron-down" />
				</button>
			)}
		</div>
	);
}

export type { CraftData };
