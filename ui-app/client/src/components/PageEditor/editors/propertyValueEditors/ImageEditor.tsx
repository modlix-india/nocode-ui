import React, { useEffect, useState } from 'react';
import { ComponentPropertyDefinition } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';
import { FileBrowser } from '../../../../commonComponents/FileBrowser';
import Portal from '../../../Portal';

interface ImageSelectionEditorProps {
	value?: string;
	propDef: ComponentPropertyDefinition;
	onChange: (v: string | undefined) => void;
	pageOperations: PageOperations;
}

export function ImageEditor({
	value,
	onChange,
	propDef,
	pageOperations,
}: Readonly<ImageSelectionEditorProps>) {
	const [showFileBrowser, setShowFileBrowser] = useState(false);
	const [chngValue, setChngValue] = useState(value ?? '');

	useEffect(() => setChngValue(value ?? ''), [value]);

	const changed = (v = chngValue) =>
		onChange(v === '' || v === propDef.defaultValue ? undefined : v);

	let popup = showFileBrowser ? (
		<div className={`_popupBackground`} onClick={() => setShowFileBrowser(false)}>
			<div
				className="_popupContainer _imagePopupContainer"
				onClick={e => e.stopPropagation()}
			>
				<FileBrowser
					selectedFile={chngValue}
					onChange={v => {
						changed(v);
						setShowFileBrowser(false);
					}}
				/>
			</div>
		</div>
	) : (
		<></>
	);

	return (
		<div className="_iconSelectionEditor">
			<div className="_pvExpressionEditor">
				<input
					className="_peInput"
					type="text"
					value={chngValue}
					placeholder={propDef.defaultValue}
					onChange={e => setChngValue(e.target.value)}
					onKeyDown={e => (e.key === 'Enter' ? changed() : undefined)}
					onBlur={() => changed()}
				/>
				<i
					className="_pillTag fa fa-search"
					onKeyDown={e => {
						if (e.key !== 'Enter' && e.key !== ' ') return;
						setShowFileBrowser(true);
					}}
					onClick={() => setShowFileBrowser(true)}
				/>
			</div>
			{popup}
		</div>
	);
}
``;
