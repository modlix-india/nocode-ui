import React from 'react';
import { isNullValue, LinkedList } from '@fincity/kirun-js';

import { getDataFromPath, PageStoreExtractor, setData } from '../../../context/StoreContext';
import { ComponentDefinition, LocationHistory, PageDefinition } from '../../../types/common';
import duplicate from '../../../util/duplicate';
import { Issue } from '../components/IssuePopup';
import { COPY_CD_KEY, CUT_CD_KEY, DRAG_CD_KEY, DRAG_COMP_NAME } from '../../../constants';
import { ComponentDefinitions } from '../../';
import NothingComponent from '../../Nothing';

const base = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const baseDivisor = BigInt('' + base.length);

export default class PageOperations {
	private defPath: string | undefined;
	private locationHistory: Array<LocationHistory>;
	private pageExtractor: PageStoreExtractor;
	private setIssue: React.Dispatch<Issue>;
	private selectedComponent: string | undefined;
	private onSelectedComponentChanged: (key: string) => void;

	constructor(
		defPath: string | undefined,
		locationHistory: Array<LocationHistory>,
		pageExtractor: PageStoreExtractor,
		setIssue: React.Dispatch<Issue>,
		selectedComponent: string | undefined,
		onSelectedComponentChanged: (key: string) => void,
	) {
		this.defPath = defPath;
		this.locationHistory = locationHistory;
		this.pageExtractor = pageExtractor;
		this.setIssue = setIssue;
		this.selectedComponent = selectedComponent;
		this.onSelectedComponentChanged = onSelectedComponentChanged;
	}

	public deleteComponent(compkey: string | undefined) {
		if (!compkey || !this.defPath) return;

		const pageDef: PageDefinition = getDataFromPath(
			this.defPath,
			this.locationHistory,
			this.pageExtractor,
		);
		if (!pageDef) return;

		if (pageDef.rootComponent === compkey) {
			this.setIssue({
				message:
					'Deleting the root component will delete the entire screen. Do you want to delete?',
				defaultOption: 'No',
				options: ['Yes', 'No'],
				callbackOnOption: {
					Yes: () => {
						if (!this.defPath) return;
						let def: PageDefinition = getDataFromPath(
							this.defPath,
							this.locationHistory,
							this.pageExtractor,
						);
						const key = this.genId();
						def = {
							...def,
							rootComponent: key,
							componentDefinition: {
								[key]: { key, name: 'Page Grid', type: 'Grid' },
							},
						};
						this.onSelectedComponentChanged('');
						setData(this.defPath, def, this.pageExtractor.getPageName());
					},
				},
			});
		} else {
			let def = {
				...pageDef,
				componentDefinition: { ...(pageDef.componentDefinition ?? {}) },
			};
			delete def.componentDefinition[compkey];
			let keys = Object.values(def.componentDefinition)
				.filter(e => e.children?.[compkey])
				.map(e => e.key);
			for (let i = 0; i < keys.length; i++) {
				const x = duplicate(def.componentDefinition[keys[i]]);
				delete x.children[compkey];
				def.componentDefinition[x.key] = x;
			}
			if (this.selectedComponent === compkey) this.onSelectedComponentChanged('');
			setData(this.defPath, def, this.pageExtractor.getPageName());
		}
	}

	public droppedOn(componentKey: string, droppedData: any, forceSameParent: boolean = false) {
		let pageDef: PageDefinition = getDataFromPath(
			this.defPath,
			this.locationHistory,
			this.pageExtractor,
		);
		if (!pageDef) return;
		pageDef = duplicate(pageDef);
		if (!pageDef.componentDefinition) pageDef.componentDefinition = {};

		if (droppedData.startsWith(DRAG_CD_KEY)) {
			const mainKey = droppedData.substring(DRAG_CD_KEY.length);
			if (mainKey === componentKey || !this.defPath) return;

			const obj = pageDef.componentDefinition[mainKey];
			if (!obj) return;
			const sourceParent = Object.values(pageDef.componentDefinition).find(
				e => e.children?.[mainKey],
			);

			if (forceSameParent && sourceParent?.children?.[componentKey]) {
				let childrenOrder = Object.keys(sourceParent.children ?? {})
					.map(e => pageDef.componentDefinition[e])
					.map(e => ({ key: e.key, displayOrder: e.displayOrder }))
					.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
				let doPosition = -1;
				let dpPosition = -1;
				for (let i = 0; i < childrenOrder.length; i++) {
					if (childrenOrder[i].key === componentKey) doPosition = i;
					else if (childrenOrder[i].key === mainKey) dpPosition = i;
				}

				let x = childrenOrder.splice(dpPosition, 1);
				if (doPosition < dpPosition) doPosition--;
				if (doPosition < 0) doPosition = 0;
				childrenOrder.splice(doPosition, 0, ...x);
				childrenOrder.forEach(
					({ key }, i) => (pageDef.componentDefinition[key].displayOrder = i + 1),
				);

				setData(this.defPath, pageDef, this.pageExtractor.getPageName());

				return;
			}
			delete pageDef.componentDefinition[mainKey];
			if (sourceParent) {
				delete sourceParent.children?.[mainKey];
			}

			this._dropOn(
				pageDef,
				componentKey,
				mainKey,
				{ [mainKey]: obj },
				sourceParent?.key,
				obj.displayOrder,
			);
		} else if (droppedData.startsWith(DRAG_COMP_NAME)) {
			const compName = droppedData.substring(DRAG_COMP_NAME.length);
			const key = this.genId();
			const obj = ComponentDefinitions.get(compName)?.defaultTemplate
				? duplicate(ComponentDefinitions.get(compName)?.defaultTemplate)
				: { name: compName, type: compName };
			obj.key = key;
			this._dropOn(pageDef, componentKey, key, { [key]: obj });
		}
	}

	public copy(componentKey: any) {
		if (!ClipboardItem) return;

		navigator.clipboard.write([
			new ClipboardItem({
				'text/plain': new Blob([`${COPY_CD_KEY}${componentKey}`], { type: 'text/plain' }),
			}),
		]);
	}

	public cut(componentKey: any) {
		if (!ClipboardItem || !this.defPath || !componentKey) return;

		let def: PageDefinition = getDataFromPath(
			this.defPath,
			this.locationHistory,
			this.pageExtractor,
		);
		if (!def) return;

		if (componentKey === def.rootComponent) {
			this.setIssue({
				message:
					'Cutting the root component will delete the entire screen. Do you want to cut?',
				defaultOption: 'No',
				options: ['Yes', 'No'],
				callbackOnOption: {
					Yes: () => {
						if (!this.defPath) return;
						let def: PageDefinition = getDataFromPath(
							this.defPath,
							this.locationHistory,
							this.pageExtractor,
						);
						const key = this.genId();
						def = duplicate(def);
						const obj = def.componentDefinition[componentKey];
						def.rootComponent = key;
						def.componentDefinition[key] = { key, name: 'Page Grid', type: 'Grid' };
						this.onSelectedComponentChanged('');
						setData(this.defPath, def, this.pageExtractor.getPageName());
					},
				},
			});
			return;
		}

		const pageDef: PageDefinition = duplicate(def);
		const obj = pageDef.componentDefinition[componentKey];
		delete pageDef.componentDefinition[componentKey];
		Object.values(pageDef.componentDefinition)
			.filter(e => e.children?.[componentKey])
			.filter(e => delete e.children?.[componentKey]);

		setData(this.defPath, pageDef, this.pageExtractor.getPageName());
		if (componentKey === this.selectedComponent) this.onSelectedComponentChanged('');

		navigator.clipboard.write([
			new ClipboardItem({
				'text/plain': new Blob([CUT_CD_KEY + JSON.stringify(obj)], { type: 'text/plain' }),
			}),
		]);
	}

	public paste(componentKey: any) {
		if (!ClipboardItem || !this.defPath || !componentKey) return;

		navigator.clipboard.readText().then(data => {
			let pageDef: PageDefinition = getDataFromPath(
				this.defPath,
				this.locationHistory,
				this.pageExtractor,
			);
			if (!pageDef) return;
			pageDef = duplicate(pageDef);
			if (!pageDef.componentDefinition) pageDef.componentDefinition = {};

			if (data.startsWith(CUT_CD_KEY)) {
				const obj = JSON.parse(data.substring(CUT_CD_KEY.length));
				if (!pageDef.componentDefinition[obj.key]) {
					this._dropOn(pageDef, componentKey, obj.key, { [obj.key]: obj });
					return;
				} else {
					data = COPY_CD_KEY + obj.key;
				}
			}

			if (data.startsWith(COPY_CD_KEY)) {
				const que = new LinkedList<{ key: string; parent: string | undefined }>();
				let mainKey = data.substring(COPY_CD_KEY.length);
				que.add({ key: mainKey, parent: undefined });
				const newComps: { [key: string]: ComponentDefinition } = {};

				while (que.size() > 0) {
					const current = que.pop();
					const obj: ComponentDefinition = duplicate(
						pageDef.componentDefinition[current.key],
					);
					obj.key = this.genId();
					if (!current.parent) mainKey = obj.key;
					else if (current.parent && newComps[current.parent]?.children)
						newComps[current.parent].children![obj.key] = true;
					newComps[obj.key] = obj;

					if (!obj.children) continue;
					Object.entries(obj.children)
						.filter(([, show]: [string, boolean]) => show)
						.forEach(([key]: [string, boolean]) => que.push({ key, parent: obj.key }));
					obj.children = {};
				}

				this._dropOn(pageDef, componentKey, mainKey, newComps);
			}
		});
	}

	private _dropOn(
		pageDef: PageDefinition,
		onKey: string,
		mainKey: string,
		comps: { [key: string]: ComponentDefinition },
		sourceParent?: string,
		sourceDisplayOrder?: number,
	) {
		//Dropped On component
		let doComp: ComponentDefinition | undefined = pageDef.componentDefinition[onKey];
		//Dropping component
		const dpComp: ComponentDefinition | undefined = comps[mainKey];

		let doCompComponent = ComponentDefinitions.get(doComp.type);
		const dpCompComponent = ComponentDefinitions.get(dpComp.type);

		if (!doComp || !dpComp) {
			this.setIssue({
				message: 'Error in finding the right component to paste/drop',
				options: ['Ok'],
				defaultOption: 'Ok',
			});
			return;
		}

		if (!doCompComponent || !dpCompComponent) {
			this.setIssue({
				message: 'Wrong component type is pasted/dropped',
				options: ['Ok'],
				defaultOption: 'Ok',
			});
			return;
		}

		let droppedOnPosition = -1;
		let sameParent = false;

		if (!doCompComponent.allowedChildrenType) {
			droppedOnPosition = doComp.displayOrder ?? -1;
			doComp = Object.values(pageDef.componentDefinition).find(e => e.children?.[onKey]);

			if (!doComp || !ComponentDefinitions.get(doComp.type)) {
				this.setIssue({
					message: 'Error in finding the right component to paste/drop',
					options: ['Ok'],
					defaultOption: 'Ok',
				});
				return;
			}

			sameParent = doComp.key === sourceParent;
		}

		doCompComponent = ComponentDefinitions.get(doComp!.type);

		if (doCompComponent?.allowedChildrenType) {
			if (!doComp.children) doComp.children = {};

			let allowedChildCount = doCompComponent.allowedChildrenType.get('');
			let isGenericChild = true;
			if (isNullValue(allowedChildCount)) {
				allowedChildCount = doCompComponent.allowedChildrenType.get(doComp.type);
				isGenericChild = false;
			}

			if (isNullValue(allowedChildCount)) {
				this.setIssue({
					message: `${doCompComponent.displayName} cannot contain ${
						dpCompComponent.displayName
					}. It can contain only ${Array.from(doCompComponent.allowedChildrenType.keys())
						.map(e => ComponentDefinitions.get(e)?.displayName!)
						.reduce((a: string, c: string, i, arr) => {
							if (i + 2 === arr.length) return a + c + ' or ';
							else if (i + 1 === arr.length) return a + c;
							else return a + c + ', ';
						}, '')}.`,
					defaultOption: 'Ok',
					options: ['Ok'],
				});

				return;
			}

			if (dpCompComponent.parentType && doCompComponent.name !== dpCompComponent.parentType) {
				this.setIssue({
					message: `${dpCompComponent.displayName} cannot be part of ${
						doCompComponent.displayName
					}. It can be part of only ${
						ComponentDefinitions.get(dpCompComponent.parentType)?.displayName
					}`,
					defaultOption: 'Ok',
					options: ['Ok'],
				});

				return;
			}

			if (allowedChildCount !== -1) {
				let count = isGenericChild
					? Object.keys(doComp.children).length
					: Object.keys(doComp.children).filter(
							e => pageDef.componentDefinition[e].type === dpComp.type,
					  ).length;
				if (count >= allowedChildCount!) {
					this.setIssue({
						message: `${doCompComponent.displayName} allows ${allowedChildCount} ${
							isGenericChild ? '' : `of type ${dpCompComponent.displayName} as`
						} children. Do you want to replace the existing components?`,
						defaultOption: 'No',
						options: ['Yes', 'No'],
						callbackOnOption: {
							Yes: () => {
								if (!doComp || !doComp.key) return;

								const inPgDef: PageDefinition = duplicate(
									getDataFromPath(
										this.defPath,
										this.locationHistory,
										this.pageExtractor,
									),
								);

								let removeChildren = isGenericChild
									? Object.keys(doComp.children ?? {})
									: Object.keys(doComp.children ?? {}).filter(
											e =>
												dpComp.type === inPgDef.componentDefinition[e].type,
									  );

								removeChildren.forEach(e => {
									delete inPgDef.componentDefinition[e];
									delete inPgDef.componentDefinition[doComp!.key]?.children?.[e];
								});

								this._updateDisplayOrder(
									inPgDef.componentDefinition[doComp.key],
									inPgDef,
									droppedOnPosition,
									comps[dpComp.key],
									comps,
									sameParent ? sourceDisplayOrder : undefined,
								);
								setData(this.defPath!, inPgDef, this.pageExtractor.getPageName());
							},
						},
					});
					return;
				}
			}

			this._updateDisplayOrder(
				doComp,
				pageDef,
				droppedOnPosition,
				dpComp,
				comps,
				sameParent ? sourceDisplayOrder : undefined,
			);
		} else {
			this.setIssue({
				message: `Cannot paste/drop ${dpCompComponent.displayName} on ${doCompComponent?.displayName}.`,
				options: ['Ok'],
				defaultOption: 'Ok',
			});
			return;
		}

		setData(this.defPath!, pageDef, this.pageExtractor.getPageName());
	}

	private _updateDisplayOrder(
		doComp: ComponentDefinition,
		pageDef: PageDefinition,
		droppedOnPosition: number,
		dpComp: ComponentDefinition,
		comps: { [key: string]: ComponentDefinition },
		droppedCompPosition?: number,
	) {
		let childrenOrder = Object.keys(doComp.children ?? {})
			.map(e => pageDef.componentDefinition[e])
			.map(e => ({ key: e.key, displayOrder: e.displayOrder }))
			.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

		if (droppedOnPosition === -1 || !childrenOrder.length) {
			dpComp.displayOrder = childrenOrder.length
				? Math.max(...childrenOrder.map(e => e.displayOrder ?? 0)) + 1
				: 0;
		} else {
			let ind = childrenOrder.findIndex(e => e.displayOrder === droppedOnPosition);
			if (ind === -1) {
				childrenOrder.push({ key: dpComp.key, displayOrder: dpComp.displayOrder });
			} else {
				if (droppedOnPosition !== -1 && !isNullValue(droppedCompPosition)) {
					if (droppedOnPosition > droppedCompPosition!) ind++;
					if (ind < 0) ind = 0;
				}
				childrenOrder.splice(ind, 0, {
					key: dpComp.key,
					displayOrder: dpComp.displayOrder,
				});
			}
		}
		if (!doComp.children) doComp.children = {};
		doComp.children[dpComp.key] = true;
		pageDef.componentDefinition = { ...pageDef.componentDefinition, ...comps };

		childrenOrder.forEach(
			({ key }, i) => (pageDef.componentDefinition[key].displayOrder = i + 1),
		);
	}

	public genId(): string {
		let hex = crypto
			? crypto.randomUUID().replace(/-/g, '')
			: Math.random().toString(16).substring(2);

		if (BigInt) {
			let num = BigInt('0x' + hex);
			let a = [];

			while (num > 0) {
				a.push(base[Number(num % baseDivisor)]);
				num = num / baseDivisor;
			}

			return a.reverse().join('');
		}

		return hex;
	}
}
