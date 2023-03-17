import React from 'react';
import { getDataFromPath, PageStoreExtractor, setData } from '../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../types/common';
import duplicate from '../../../util/duplicate';
import { Issue } from '../components/IssuePopup';

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
