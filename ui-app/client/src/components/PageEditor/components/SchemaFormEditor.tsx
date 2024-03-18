import React from 'react';
import Portal from '../../Portal';
import { PageStoreExtractor } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { Editor } from '@monaco-editor/react';

interface SchemaFormEditorProps {
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	clickedComponent: string;
	setShowSchemaFormEditor: (key: string) => void;
}

export default function SchemaFormEditor({
	setShowSchemaFormEditor,
	clickedComponent,
}: SchemaFormEditorProps) {
	const [schemaValue, setSchemaValue] = React.useState('');
	const [editorValue, setEditorValue] = React.useState('');
	const [enableNext, setEnableNext] = React.useState(false);
	const [showNextScreen, setShowNextScreen] = React.useState(false);

	const handleClose = () => {
		setShowSchemaFormEditor('');
	};

	React.useEffect(() => {
		console.log(schemaValue, 'picard');
		setEditorValue(schemaValue);
	}, [schemaValue]);
	console.log('kirk', editorValue);

	const handleNext = () => {
		try {
			const v = JSON.parse(editorValue);
			if (Object.keys(v).length === 0) return;
			setSchemaValue(editorValue);
			setShowNextScreen(true);
		} catch (error) {
			setEnableNext(false);
		}
	};

	return (
		<Portal>
			<div className={`_popupBackground`} onClick={handleClose}>
				<div
					className="_popupContainer _schemaFormEditor"
					onClick={e => e.stopPropagation()}
				>
					Schema Form Editor
					<div className="_schemaFormEditorContainer">
						{!showNextScreen && (
							<div className="_jsonEditorContainer">
								<Editor
									language="json"
									height="100%"
									value={editorValue}
									onChange={value => {
										setEditorValue(value ?? '');
										try {
											if (value !== 'undefined' && value !== 'null' && value)
												JSON.parse(value);
											setEnableNext(true);
										} catch (err) {
											setEnableNext(false);
										}
									}}
								/>
							</div>
						)}
						<div className="_popupButtons">
							{showNextScreen && (
								<button
									onClick={() => {
										setShowNextScreen(false);
									}}
								>
									Back
								</button>
							)}
							{!showNextScreen && (
								<button disabled={!enableNext} onClick={handleNext}>
									Next
								</button>
							)}

							<button
								onClick={() => {
									setShowSchemaFormEditor('');
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
