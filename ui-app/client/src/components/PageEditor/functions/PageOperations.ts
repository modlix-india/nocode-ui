import React from 'react';
import { LinkedList } from '@fincity/kirun-js';

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

	public droppedOn(componentKey: string, droppedData: any) {
		console.log(componentKey, droppedData);
		if (droppedData.startsWith(DRAG_CD_KEY)) {
		} else if (droppedData.startsWith(DRAG_COMP_NAME)) {
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
					if (current.key === mainKey) mainKey = obj.key;

					if (!obj.children) continue;
					Object.entries(obj.children)
						.filter(([, show]: [string, boolean]) => show)
						.forEach(([key]: [string, boolean]) => que.push({ key, parent: obj.key }));
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
	) {
		//Dropped On component
		const doComp = pageDef.componentDefinition[onKey];
		//Dropping component
		const dpComp = comps[mainKey];

		const doCompComponent = ComponentDefinitions.get(doComp.type);
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

		if ()
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
