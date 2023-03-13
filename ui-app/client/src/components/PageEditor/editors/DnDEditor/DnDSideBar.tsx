import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	PageStoreExtractor,
} from '../../../../context/StoreContext';

interface DnDSideBarProps {
	personalizationPath: string | undefined;
	pageName: string | undefined;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
}

export default function DnDSideBar({
	personalizationPath,
	pageName,
	pageExtractor,
	onChangePersonalization,
}: DnDSideBarProps) {
	const [noSelection, setNoSelection] = useState<boolean>(false);
	const [noShell, setNoShell] = useState<boolean>(false);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, v) => setNoSelection(v ?? false),
				pageExtractor,
				`${personalizationPath}.slave.noSelection`,
			),
		[personalizationPath],
	);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, v) => setNoShell(v ?? false),
				pageExtractor,
				`${personalizationPath}.slave.noShell`,
			),
		[personalizationPath],
	);

	return (
		<div className="_sideBar">
			<div className="_top"></div>
			<div className="_bottom">
				<div
					className="_iconMenu"
					tabIndex={0}
					onClick={() => onChangePersonalization('slave.noSelection', !noSelection)}
				>
					<span
						className="fa-stack"
						title={noSelection ? 'Enable Selection' : 'Disable Selection'}
					>
						<i className="fa fa-solid fa-arrow-pointer fa-stack-1x"></i>
						<i
							className="fa fa-solid fa-slash fa-stack-1x"
							style={{ opacity: noSelection ? '0' : '1' }}
						></i>
					</span>
				</div>
				<div
					className="_iconMenu"
					tabIndex={0}
					onClick={() => onChangePersonalization('slave.noShell', !noShell)}
					title={noSelection ? 'Disable Selection' : 'Enable Selection'}
				>
					<i
						className={`fa fa-solid ${
							noShell ? 'fa-window-maximize' : 'fa-window-restore'
						}`}
						title={noSelection ? 'Show Shell' : 'Hide Shell'}
					/>
				</div>
			</div>
		</div>
	);
}
