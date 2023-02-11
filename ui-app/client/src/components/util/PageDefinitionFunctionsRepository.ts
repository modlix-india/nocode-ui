import { Function, FunctionDefinition, KIRuntime, Repository } from '@fincity/kirun-js';
import { PageDefinition } from '../../types/common';

export default class PageDefintionFunctionsRepository implements Repository<Function> {
	private pageDefinition: PageDefinition | undefined;

	constructor(pageDefinition?: PageDefinition) {
		this.pageDefinition = pageDefinition;
	}

	public find(namespace: string, name: string): Function | undefined {
		if (!this.pageDefinition?.eventFunctions || namespace !== '_') return undefined;

		const fd = this.pageDefinition.eventFunctions[name];
		if (!fd) return undefined;

		return new KIRuntime(FunctionDefinition.from(fd), false);
	}
}
