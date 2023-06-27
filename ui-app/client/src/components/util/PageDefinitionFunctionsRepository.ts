import { Function, FunctionDefinition, KIRuntime, Repository } from '@fincity/kirun-js';
import { PageDefinition } from '../../types/common';

export default class PageDefintionFunctionsRepository implements Repository<Function> {
	private pageDefinition: PageDefinition | undefined;

	constructor(pageDefinition?: PageDefinition) {
		this.pageDefinition = pageDefinition;
	}

	public async find(namespace: string, name: string): Promise<Function | undefined> {
		if (!this.pageDefinition?.eventFunctions || (namespace !== '_' && namespace !== undefined))
			return undefined;

		const fd = Object.values(this.pageDefinition.eventFunctions ?? {}).filter(
			e => e.name === name,
		)?.[0];
		if (!fd) return undefined;

		const funDef = FunctionDefinition.from(fd);
		return new KIRuntime(funDef, isDesignMode || isDebugMode);
	}

	public async filter(name: string): Promise<string[]> {
		const lowerCaseName = name.toLowerCase();

		return Array.from(
			new Set(
				Object.values(this.pageDefinition?.eventFunctions || {})
					.map(e => (e.namespace ? e.namespace + '.' + e.name : e.name))
					.filter(e => e.toLowerCase().includes(lowerCaseName))
					.map(e => e),
			),
		);
	}
}
