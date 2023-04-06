import { isNullValue, KIRunSchemaRepository } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import KIRunEditor from '../../KIRunEditor/KIRunEditor';
import { UIFunctionRepository } from '../../../functions';
import { UISchemaRepository } from '../../../schemas/common';
import { LocationHistory, PageDefinition, RenderContext } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../../context/StoreContext';
import duplicate from '../../../util/duplicate';
import { COPY_CD_KEY, COPY_FUNCTION_KEY } from '../../../constants';

interface CodeEditorProps {
	showCodeEditor: string | undefined;
	onSetShowCodeEditor: (key: string | undefined) => void;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
	pageDefinition: PageDefinition;
	pageExtractor: PageStoreExtractor;
}

export default function CodeEditor({
	showCodeEditor,
	onSetShowCodeEditor,
	defPath,
	locationHistory,
	context,
	pageDefinition,
	pageExtractor,
}: CodeEditorProps) {
	const uuid = useMemo(() => shortUUID(), []);
	const [fullScreen, setFullScreen] = useState(false);
	const [selectedFunction, setSelectedFunction] = useState(showCodeEditor);
	const [editPage, setEditPage] = useState<any>();

	const eventFunctions = editPage?.eventFunctions ?? {};

	useEffect(() => {
		if (showCodeEditor === selectedFunction && selectedFunction !== '') return;

		if ((!selectedFunction || showCodeEditor === '') && !isNullValue(eventFunctions)) {
			setSelectedFunction(Object.keys(eventFunctions)[0] ?? '');
		} else {
			setSelectedFunction(showCodeEditor);
		}
	}, [showCodeEditor, eventFunctions]);

	useEffect(() => {
		if (!defPath) return;
		return addListenerAndCallImmediately((_, v) => setEditPage(v), pageExtractor, defPath);
	}, [defPath]);

	const changeEventFunction = useCallback(
		(key: string, functionObj: any) => {
			if (!defPath) return;

			const npageDefinition = duplicate(
				getDataFromPath(defPath, locationHistory, pageExtractor),
			) as PageDefinition;
			if (isNullValue(npageDefinition.eventFunctions)) npageDefinition.eventFunctions = {};
			const newEvFunc = npageDefinition.eventFunctions;
			if (isNullValue(functionObj)) delete newEvFunc[key];
			else newEvFunc[key] = functionObj;
			setData(defPath, npageDefinition, pageExtractor.getPageName());
			if (isNullValue(functionObj)) onSetShowCodeEditor('');
			else if (selectedFunction !== key) onSetShowCodeEditor(key);
		},
		[defPath, locationHistory, pageExtractor],
	);

	if (isNullValue(showCodeEditor))
		return (
			<div className="_codeEditor">
				<div className="_codeEditorContent"></div>
			</div>
		);

	return (
		<div className="_codeEditor show" onClick={e => onSetShowCodeEditor(undefined)}>
			<div
				className={`_codeEditorContent ${fullScreen ? '_fullScreen' : ''}`}
				onClick={e => e.stopPropagation()}
			>
				<div className="_codeEditorHeader">
					<div className="_codeFunctions">
						<div className="_iconMenu" title="Code Editor">
							<i className="fa-solid fa-code" />
						</div>
						<select
							value={selectedFunction}
							onChange={e => onSetShowCodeEditor(e.target.value)}
							title="Select a function to edit"
						>
							{(eventFunctions ? Object.entries(eventFunctions) : []).map(
								([key, funct]: [string, any]) => {
									return (
										<option key={key} value={key}>
											{funct.namespace
												? `${funct.namespace}.${funct.name}`
												: funct.name}
										</option>
									);
								},
							)}
						</select>
						<div
							className="_iconMenu"
							title="Create a new function"
							onClick={() => {
								let i = 0;
								let name = 'New_Function';
								while (
									Object.values(eventFunctions).findIndex(
										(v: any) => v.name === name,
									) !== -1
								) {
									i++;
									name = `New_Function_${i}`;
								}

								changeEventFunction(shortUUID(), { name, steps: {} });
							}}
						>
							<i className="fa fa-regular fa-square-plus" />
						</div>
						{!selectedFunction ? (
							<></>
						) : (
							<div
								title="Delete this function"
								className="_iconMenu"
								onClick={() => changeEventFunction(selectedFunction, undefined)}
							>
								<i className="fa fa-regular fa-trash-can" />
							</div>
						)}
						<div className="_iconMenuSeperator" />
						{!selectedFunction ? (
							<></>
						) : (
							<div
								title="Copy this function"
								className="_iconMenu"
								onClick={() => {
									if (!ClipboardItem || !selectedFunction) return;

									navigator.clipboard.write([
										new ClipboardItem({
											'text/plain': new Blob(
												[
													COPY_FUNCTION_KEY +
														JSON.stringify({
															key: selectedFunction,
															functionDefinition:
																eventFunctions[selectedFunction],
														}),
												],
												{
													type: 'text/plain',
												},
											),
										}),
									]);
								}}
							>
								<i className="fa fa-regular fa-clipboard" />
							</div>
						)}
						<div
							title="Paste copied function"
							className="_iconMenu"
							onClick={() => {
								if (!ClipboardItem) return;
								navigator.clipboard.readText().then(data => {
									if (!data.startsWith(COPY_FUNCTION_KEY)) return;

									const functWithKey = JSON.parse(
										data.substring(COPY_FUNCTION_KEY.length),
									);

									const funct = functWithKey.functionDefinition;

									if (
										Object.values(eventFunctions).findIndex(
											(v: any) =>
												v.name === funct.name &&
												v.namespace === funct.namespace,
										) !== -1
									) {
										let name = funct.name + '_copy';
										let i = 0;
										while (
											Object.values(eventFunctions).findIndex(
												(v: any) => v.name === name,
											) !== -1
										) {
											i++;
											name = `${funct.name}_copy_${i}`;
										}

										funct.name = name;
									}

									changeEventFunction(
										eventFunctions[functWithKey.key]
											? shortUUID()
											: functWithKey.key,
										funct,
									);
								});
							}}
						>
							<i className="fa fa-regular fa-paste" />
						</div>
						{!selectedFunction ? (
							<></>
						) : (
							<>
								<div className="_iconMenuSeperator" />
								<div
									className="_iconMenu"
									title="Validation trigger on the element"
								>
									<i className="fa-solid fa-check-double" />
									<select
										value={
											eventFunctions[selectedFunction].validationCheck ?? ''
										}
									>
										<option>--None--</option>
										{Object.values(editPage.componentDefinition ?? {}).map(
											(e: any) => (
												<option key={e.key} value={e.key}>
													{e.name ?? e.key}
												</option>
											),
										)}
									</select>
								</div>
							</>
						)}
					</div>
					<div className="_codeButtons">
						<div className="_iconMenu" onClick={() => setFullScreen(!fullScreen)}>
							<i
								className={`fa fa-solid ${
									fullScreen
										? 'fa-down-left-and-up-right-to-center'
										: 'fa-up-right-and-down-left-from-center'
								}`}
							></i>
						</div>
						<div className="_iconMenu" onClick={() => onSetShowCodeEditor(undefined)}>
							<i className="fa fa-solid fa-close"></i>
						</div>
					</div>
				</div>
				<KIRunEditor.component
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					definition={{ key: uuid, name: 'Code Editor', type: 'KIRunEditor' }}
				/>
			</div>
		</div>
	);
}
