import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useState } from 'react';
import Portal from '../../Portal';
import { IconHelper } from '../../util/IconHelper';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import { LocationHistory, PageDefinition } from '../../../types/common';
import { PageStoreExtractor, getDataFromPath, setData } from '../../../context/StoreContext';
import { getHref } from '../../util/getHref';
import axios from 'axios';
import { shortUUID } from '../../../util/shortUUID';
import { LOCAL_STORE_PREFIX } from '../../../constants';
import { generateFormPreview } from '../functions/CompDefgenerator';
import { generateFormEvents } from '../functions/EventDefGenerator';

interface FormName {
	appCode: string;
	clientCode: string;
	id: number;
	name: string;
}

interface FormEditorProps {
	formStorageUrl: string;
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	clickedComponent: string;
	setClickedComponent: (pref: any) => void;
}

function callForFormDef(
	defPath: string | undefined,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	formStorageUrl: string,
	setFormDefs: (pref: any) => void,
	setTotalPages: (pref: any) => void,
	activePage: number,
) {
	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

	let pageDef = getDataFromPath(defPath, locationHistory, pageExtractor);
	(async () => {
		let appCode = `?appCode=${pageDef.appCode}`;
		let clientCode = `&clientCode=${pageDef.clientCode}`;
		let url =
			getHref(formStorageUrl, location) +
			appCode +
			clientCode +
			`&size=10&page=${activePage - 1}`;
		await axios
			.get(url, {
				headers,
			})
			.then(res => {
				setTotalPages(res.data.totalPages);
				let helperArray: FormName[] = [];
				res.data.content.map((each: any) => {
					helperArray.push({
						appCode: each.appCode,
						clientCode: each.clientCode,
						id: each.id,
						name: each.name,
					});
				});
				setFormDefs(helperArray);
			})
			.finally();
	})();
}

function eachFormDefinition(
	currentFormId: number,
	currentFormName: string,
	formStorageUrl: string,
	setFormName: (pref: any) => void,
	setEachFormDef: (pref: any) => void,
) {
	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();
	if (currentFormId) {
		(async () => {
			let url = getHref(formStorageUrl.split('?')[0], location) + '/' + currentFormId;
			await axios
				.get(url, {
					headers,
				})
				.then(res => {
					setFormName(res.data.name);
					setEachFormDef(
						generateFormPreview(res.data.fieldDefinitionMap, currentFormName),
					);
				})
				.finally();
		})();
	}
}

export default function FormEditor({
	formStorageUrl,
	defPath,
	pageExtractor,
	locationHistory,
	clickedComponent,
	setClickedComponent,
}: FormEditorProps) {
	const [eachFormDef, setEachFormDef] = useState<any>({});
	const [fieldChecked, setFieldChecked] = useState<Set<string>>(new Set());
	const [formName, setFormName] = useState<string>('');
	const [formDefs, setFormDefs] = useState<FormName[]>();
	const [showFormFields, setShowFormFields] = useState<boolean>(false);
	const [addSubmitButton, setAddSubmitButton] = useState<boolean>(false);
	const [addClearButton, setAddClearButton] = useState<boolean>(false);
	const [activePage, setActivePage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);

	useEffect(() => {
		callForFormDef(
			defPath,
			locationHistory,
			pageExtractor,
			formStorageUrl,
			setFormDefs,
			setTotalPages,
			activePage,
		);
	}, [activePage]);

	const handleCloseForm = () => {
		setClickedComponent('');
	};

	const handlePageClick = (pageNumber: number) => {
		setActivePage(pageNumber);
	};

	function handleGenerateForm() {
		setClickedComponent('');
		const pageDef = getDataFromPath(defPath, locationHistory, pageExtractor);

		if (!defPath) return;

		let newPageDef = generateFormEvents(
			pageDef,
			formName,
			eachFormDef,
			fieldChecked,
			addSubmitButton,
			addClearButton,
			clickedComponent,
		);
		setData(defPath, newPageDef, pageExtractor.getPageName());
	}

	function handleCheckbox(each: any) {
		!fieldChecked?.has(each.key)
			? setFieldChecked(prevSelectedFormComponent => {
					const updatedSet = new Set(prevSelectedFormComponent ?? []);
					updatedSet.add(each.key);
					return updatedSet;
			  })
			: setFieldChecked(prevSelectedFormComponent => {
					const updatedSet = new Set(prevSelectedFormComponent);
					updatedSet.delete(each.key);
					return updatedSet;
			  });
	}

	const prevPage = () => {
		if (activePage > 1) {
			setActivePage(activePage - 1);
		}
	};

	const nextPage = () => {
		if (activePage < totalPages) {
			setActivePage(activePage + 1);
		}
	};

	const formBuilderContent = showFormFields ? (
		<div className="_popupContainer _formEditor" onClick={e => e.stopPropagation()}>
			<div className="_formButton">
				<div className="_backButton" onClick={() => setShowFormFields(false)}>
					<IconHelper viewBox="0 0 7 12">
						<path
							d="M1.18307 5.4957C0.938977 5.77463 0.938977 6.2276 1.18307 6.50653L4.93234 10.7908C5.17643 11.0697 5.57284 11.0697 5.81693 10.7908C6.06102 10.5119 6.06102 10.0589 5.81693 9.77998L2.50898 6L5.81498 2.22002C6.05907 1.94109 6.05907 1.48812 5.81498 1.20919C5.57089 0.930269 5.17448 0.930269 4.93039 1.20919L1.18112 5.49347L1.18307 5.4957Z"
							fill="black"
							fillOpacity="0.4"
						/>
						<path
							d="M1.06824 5.39469L0.981785 5.49348L0.990665 5.50363C0.779561 5.83824 0.806069 6.3035 1.07019 6.60531L4.81946 10.8896C5.12331 11.2368 5.62596 11.2368 5.92981 10.8896C6.2234 10.5541 6.2234 10.0167 5.92981 9.6812L2.70828 5.99997L5.92786 2.3188C6.22144 1.98332 6.22144 1.44589 5.92786 1.11041C5.624 0.763197 5.12136 0.763197 4.81751 1.11041L1.06824 5.39469Z"
							stroke="black"
							strokeOpacity="0.4"
							strokeWidth="0.3"
						/>
					</IconHelper>
					Back
				</div>
				<div className="_iconMenu" onClick={handleCloseForm}>
					<i className="fa fa-solid fa-close"></i>
				</div>
			</div>
			<div className="_formEditorContent">
				<div className="_formEditorHeader">Field Selection</div>
				<div className="_formEditorSubHeader">
					Pick the fields you want for this form from the storage you created
				</div>
				<div className="_formEditorBottomBorder"></div>
				<div className="_formElements">
					<div className="_formFieldsAndButtons">
						<p className="_formFieldsAndButtonsTitle">Fields</p>
						{Object.values(eachFormDef)?.map((each: any, index: number) => {
							return (
								<div className="_formFieldAndButton" key={index}>
									<p className="_formFieldAndButtonTitle">{each?.name}</p>
									<input
										className="_formFieldAndButtonCheckbox"
										type="checkbox"
										checked={fieldChecked?.has(each.key)}
										onChange={() => {
											handleCheckbox(each);
										}}
									></input>
								</div>
							);
						})}
					</div>
					<div className="_formFieldsAndButtons">
						<p className="_formFieldsAndButtonsTitle">Buttons</p>
						<div className="_formFieldAndButton">
							<p className="_formFieldAndButtonTitle">Submit</p>
							<input
								className="_formFieldAndButtonCheckbox"
								type="checkbox"
								checked={addSubmitButton}
								onChange={() => {
									!addSubmitButton
										? setAddSubmitButton(true)
										: setAddSubmitButton(false);
								}}
							></input>
						</div>
						<div className="_formFieldAndButton">
							<p className="_formFieldAndButtonTitle">Clear</p>
							<input
								className="_formFieldAndButtonCheckbox"
								type="checkbox"
								checked={addClearButton}
								onChange={() => {
									!addClearButton
										? setAddClearButton(true)
										: setAddClearButton(false);
								}}
							></input>
						</div>
					</div>
				</div>
				<div className="_generateButton" onClick={() => handleGenerateForm()}>
					Generate Form
				</div>
			</div>
		</div>
	) : (
		<div className="_popupContainer _formEditor" onClick={e => e.stopPropagation()}>
			<div className="_formButton">
				<div></div>
				<div className="_iconMenu" onClick={handleCloseForm}>
					<i className="fa fa-solid fa-close"></i>
				</div>
			</div>
			<div className="_formEditorContent">
				<div className="_formEditorHeader">Form Storage</div>
				<div className="_formEditorSubHeader">
					Choose the storage system you made and design a form for your website here
				</div>
				<div className="_formEditorBottomBorder"></div>
				<div className="_formEditorFilesTitle">Files</div>
				<div className="_formEditorOptions">
					{formDefs?.map((each, index) => {
						return (
							<div
								className="_formEditorEachOption"
								onClick={() => {
									eachFormDefinition(
										each.id,
										each.name,
										formStorageUrl,
										setFormName,
										setEachFormDef,
									);
									setShowFormFields(true);
								}}
								key={index}
							>
								<div className="_formEditorEachOptionPreview">
									{each?.clientCode}
								</div>
								<div className="_formEditorEachOptionName">{each?.name}</div>
							</div>
						);
					})}
				</div>
				<div className="_formEditorOptionsPagination">
					<div className="_paginationPrev" onClick={prevPage}>
						Prev
					</div>
					<div className="_paginationPages">{`${activePage}/${totalPages}`}</div>
					<div className="_paginationNext" onClick={nextPage}>
						Next
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<Portal>
			<div className={`_popupBackground`} onClick={handleCloseForm}>
				{formBuilderContent}
			</div>
		</Portal>
	);
}
