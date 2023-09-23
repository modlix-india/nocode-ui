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
}: StyleEditorsProps & DetailStyleEditorProps) {
	const [position, setPosition] = React.useState<CSSProperties>({ right: 300, top: 300 });

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {},
			pageExtractor,
			`${personalizationPath}.detailStyleEditor`,
		);
	}, [personalizationPath]);

	if (!groupName) return <></>;

	const SpecificEditor = Style_Group_Editors.get(groupName)!.component;

	const editor = (
		<SpecificEditor
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
					width="14"
					height="14"
					viewBox="0 0 14 14"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					onClick={onClickClose}
					className="_close"
				>
					<path
						d="M12.6449 3.04935C13.1134 2.58082 13.1134 1.81993 12.6449 1.3514C12.1763 0.882867 11.4154 0.882867 10.9469 1.3514L7 5.30205L3.04935 1.35515C2.58082 0.886616 1.81993 0.886616 1.3514 1.35515C0.882867 1.82368 0.882867 2.58457 1.3514 3.0531L5.30205 7L1.35515 10.9506C0.886616 11.4192 0.886616 12.1801 1.35515 12.6486C1.82368 13.1171 2.58457 13.1171 3.0531 12.6486L7 8.69795L10.9506 12.6449C11.4192 13.1134 12.1801 13.1134 12.6486 12.6449C13.1171 12.1763 13.1171 11.4154 12.6486 10.9469L8.69795 7L12.6449 3.04935Z"
						fill="black"
						stroke="#F8FAFB"
						stroke-width="1.5"
					/>
				</svg>
			</div>
			<div className="_editorContent">{editor}</div>
		</div>
	);
}
