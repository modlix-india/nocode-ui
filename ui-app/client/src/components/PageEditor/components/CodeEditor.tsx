import { HybridRepository, TokenValueExtractor, isNullValue } from '@fincity/kirun-js';
import { StoreExtractor } from '@fincity/path-reactive-state-management';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { COPY_FUNCTION_KEY, LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import { LocationHistory, PageDefinition, RenderContext } from '../../../types/common';
import duplicate from '../../../util/duplicate';
import { shortUUID } from '../../../util/shortUUID';
import KIRunEditor from '../../KIRunEditor/KIRunEditor';
import PageDefintionFunctionsRepository from '../../util/PageDefinitionFunctionsRepository';
import { ThemeExtractor } from '../../../context/ThemeExtractor';
import { UIFunctionRepository } from '../../../functions';

interface CodeEditorProps {
	showCodeEditor: string | undefined;
	onSetShowCodeEditor: (key: string | undefined) => void;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
	pageDefinition: PageDefinition;
	pageExtractor: PageStoreExtractor;
	slaveStore: any;
}

export default function CodeEditor({
	showCodeEditor,
	onSetShowCodeEditor,
	defPath,
	locationHistory,
	context,
	pageDefinition,
	pageExtractor,
	slaveStore,
}: CodeEditorProps) {
	const uuid = useMemo(() => shortUUID(), []);
	const [fullScreen, setFullScreen] = useState(false);
	const [selectedFunction, setSelectedFunction] = useState(showCodeEditor);
	const [editPage, setEditPage] = useState<any>();
	const [primedToClose, setPrimedToClose] = useState(false);

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
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => setEditPage(v),
			pageExtractor,
			defPath,
		);
	}, [defPath]);

	const tokenValueExtractors = useMemo(() => {
		if (!slaveStore) return new Map<string, TokenValueExtractor>();

		const localStoreExtractor = new StoreExtractor(
			slaveStore.localStore,
			`${LOCAL_STORE_PREFIX}.`,
		);
		const storeExtractor = new StoreExtractor(slaveStore.store, `${STORE_PREFIX}.`);
		const pageStoreExtractor = new PageStoreExtractor(slaveStore.store);
		const themeExtractor = new ThemeExtractor();
		themeExtractor.setStore(slaveStore.store);
		return new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
			[pageStoreExtractor.getPrefix(), pageStoreExtractor],
			[themeExtractor.getPrefix(), themeExtractor],
		]);
	}, [slaveStore]);

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
		<div
			className="_codeEditor show"
			onMouseDown={e => (e.target === e.currentTarget ? setPrimedToClose(true) : null)}
			onMouseUp={e => {
				if (e.target !== e.currentTarget || !primedToClose) return;
				onSetShowCodeEditor(undefined);
				setPrimedToClose(false);
			}}
		>
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
								</div>
								<select
									value={eventFunctions[selectedFunction]?.validationCheck ?? ''}
									onChange={e => {
										let newFun = duplicate(eventFunctions[selectedFunction]);
										if (e.target.value === '') {
											delete newFun.validationCheck;
										} else {
											newFun.validationCheck = e.target.value;
										}
										changeEventFunction(selectedFunction, newFun);
									}}
								>
									<option value="">--None--</option>
									{Object.values(editPage.componentDefinition ?? {})
										.sort((a: any, b: any) =>
											(a.name ?? a.key).localeCompare(b.name ?? b.key),
										)
										.map((e: any) => (
											<option key={e.key} value={e.key}>
												{e.name ?? e.key}
											</option>
										))}
								</select>
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
					definition={{
						key: uuid,
						name: 'Code Editor',
						type: 'KIRunEditor',
						properties: {
							editorType: { value: 'ui' },
						},
						bindingPath: {
							type: 'VALUE',
							value: selectedFunction
								? `${defPath}.eventFunctions.${selectedFunction}`
								: '',
						},
					}}
					functionRepository={
						new HybridRepository(
							UIFunctionRepository,
							new PageDefintionFunctionsRepository(editPage),
						)
					}
					tokenValueExtractors={tokenValueExtractors}
				/>
			</div>
		</div>
	);
}
