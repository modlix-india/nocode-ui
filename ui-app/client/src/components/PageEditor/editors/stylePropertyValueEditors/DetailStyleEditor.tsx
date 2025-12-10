import React, { CSSProperties, useEffect } from 'react';
import { StyleEditorsProps } from './simpleEditors';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { Style_Group_Editors } from '.';

interface DetailStyleEditorProps {
	groupName: string;
	onClickClose: () => void;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
}

export function DetailStyleEditor({
	groupName,
	personalizationPath,
	pageExtractor,
	onChangePersonalization,
	onClickClose,
	appDef,
	subComponentName,
	pseudoState,
	iterateProps,
	pageDef,
	editPageName,
	slaveStore,
	storePaths,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
	pageOperations,
	selectedComponentsList,
	defPath,
	locationHistory,
}: StyleEditorsProps & DetailStyleEditorProps) {
	const [position, setPosition] = React.useState<CSSProperties>({ right: 300, top: 300 });

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {},
			`${personalizationPath}.detailStyleEditor`,
		);
	}, [personalizationPath]);

	if (!groupName) return <></>;

	const SpecificEditor = Style_Group_Editors.get(groupName)!.component;

	const editor = (
		<SpecificEditor
			selectedComponentsList={selectedComponentsList}
			defPath={defPath}
			locationHistory={locationHistory}
			pageExtractor={pageExtractor}
			key="specificEditor"
			appDef={appDef}
			subComponentName={subComponentName}
			pseudoState={pseudoState}
			iterateProps={iterateProps}
			pageDef={pageDef}
			editPageName={editPageName}
			slaveStore={slaveStore}
			storePaths={storePaths}
			selectorPref={selectorPref}
			styleProps={styleProps}
			selectedComponent={selectedComponent}
			saveStyle={saveStyle}
			properties={properties}
			pageOperations={pageOperations}
			isDetailStyleEditor={true}
		/>
	);

	return (
		<div className="_detailStyleEditor" style={position}>
			<div
				className="_header"
				onMouseDown={e => {
					e.preventDefault();
					e.stopPropagation();
					const startX = e.clientX;
					const startY = e.clientY;
					const startWidth = typeof position.right === 'number' ? position.right : 0;
					const startHeight = typeof position.top === 'number' ? position.top : 0;
					const mouseMoveHandler = (e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						if (e.buttons !== 1) {
							document.body.removeEventListener('mousemove', mouseMoveHandler);
							document.body.removeEventListener('mouseup', mouseUpHandler);
							document.body.addEventListener('mouseleave', mouseUpHandler);
							return;
						}
						setPosition({
							right: startWidth + startX - e.clientX,
							top: startHeight + e.clientY - startY,
						});
					};
					const mouseUpHandler = () => {
						e.preventDefault();
						e.stopPropagation();
						document.removeEventListener('mousemove', mouseMoveHandler);
						document.removeEventListener('mouseup', mouseUpHandler);
						document.body.addEventListener('mouseleave', mouseUpHandler);
					};
					document.addEventListener('mousemove', mouseMoveHandler);
					document.addEventListener('mouseup', mouseUpHandler);
					document.body.addEventListener('mouseleave', mouseUpHandler);
				}}
			>
				<span className="_title">
					Detailed {Style_Group_Editors.get(groupName)?.displayName.toLowerCase()}{' '}
					settings
				</span>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					onClick={onClickClose}
					className="_close"
				>
					<path
						d="M6 12C7.5913 12 9.11742 11.3679 10.2426 10.2426C11.3679 9.11742 12 7.5913 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 7.5913 0.632141 9.11742 1.75736 10.2426C2.88258 11.3679 4.4087 12 6 12ZM4.10156 4.10156C4.32188 3.88125 4.67812 3.88125 4.89609 4.10156L5.99766 5.20312L7.09922 4.10156C7.31953 3.88125 7.67578 3.88125 7.89375 4.10156C8.11172 4.32188 8.11406 4.67812 7.89375 4.89609L6.79219 5.99766L7.89375 7.09922C8.11406 7.31953 8.11406 7.67578 7.89375 7.89375C7.67344 8.11172 7.31719 8.11406 7.09922 7.89375L5.99766 6.79219L4.89609 7.89375C4.67578 8.11406 4.31953 8.11406 4.10156 7.89375C3.88359 7.67344 3.88125 7.31719 4.10156 7.09922L5.20312 5.99766L4.10156 4.89609C3.88125 4.67578 3.88125 4.31953 4.10156 4.10156Z"
						fill="black"
						fillOpacity="0.3"
					/>
				</svg>
			</div>
			<div className="_editorContent">{editor}</div>
		</div>
	);
}
