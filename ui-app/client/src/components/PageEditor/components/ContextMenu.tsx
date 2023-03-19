import React, { useState, useEffect, useCallback } from 'react';
import { PageStoreExtractor, addListener } from '../../../context/StoreContext';
import Portal from '../../Portal';
import PageOperations from '../functions/PageOperations';

export interface ContextMenuDetails {
	componentKey: string;
	menuPosition: { x: number; y: number };
}

interface ContextMenuProps {
	menuDetails: ContextMenuDetails | undefined;
	personalizationPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	onCloseContextmenu: () => void;
	pageOperations: PageOperations;
}

export function ContextMenu({
	menuDetails,
	personalizationPath,
	pageExtractor,
	onCloseContextmenu,
	pageOperations,
}: ContextMenuProps) {
	const [theme, setTheme] = useState('_light');

	useEffect(() => {
		if (!personalizationPath) return;

		return addListener(
			(_, v) => setTheme(v ?? '_light'),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	if (!menuDetails) return <></>;

	let left: number | string =
		menuDetails.menuPosition.x - (window.screenLeft + (window.outerWidth - window.innerWidth));
	let top: number | string =
		menuDetails.menuPosition.y - (window.screenTop + (window.outerHeight - window.innerHeight));

	let right: number | string = 'auto';
	let bottom: number | string = 'auto';

	if (window.innerHeight - top < 200) {
		bottom = window.innerHeight - top;
		top = 'auto';
	}

	if (window.innerWidth - left < 200) {
		right = window.innerWidth - left;
		left = 'auto';
	}

	return (
		<Portal>
			<div
				className={`_popupMenuBackground ${theme}`}
				onClick={onCloseContextmenu}
				onContextMenu={e => {
					e.preventDefault();
				}}
			>
				<div className="_popupMenuContainer" style={{ left, top, right, bottom }}>
					<div className="_popupMenu">
						<div
							className="_popupMenuItem"
							title="Delete"
							onClick={() => pageOperations.deleteComponent(menuDetails.componentKey)}
						>
							<i className="fa fa-solid fa-trash" />
							Delete
						</div>
						<div className="_popupMenuSeperator" />
						<div
							className="_popupMenuItem"
							title="Copy"
							onClick={() => pageOperations.copy(menuDetails.componentKey)}
						>
							<i className="fa fa-solid fa-copy" />
							Copy
						</div>
						<div
							className="_popupMenuItem"
							title="Cut"
							onClick={() => pageOperations.cut(menuDetails.componentKey)}
						>
							<i className="fa fa-solid fa-scissors" />
							Cut
						</div>
						<div className="_popupMenuSeperator" />
						<div
							className="_popupMenuItem"
							title="Paste"
							onClick={() => pageOperations.paste(menuDetails.componentKey)}
						>
							<i className="fa fa-solid fa-clipboard" />
							Paste
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
