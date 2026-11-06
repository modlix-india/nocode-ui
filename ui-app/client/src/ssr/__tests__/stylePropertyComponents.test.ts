import { shellDefinitionFor, stylePropertyComponentsFor } from '../stylePropertyComponents';

const page = { componentDefinition: { a: { type: 'Button' }, b: { type: 'Grid' } } };
const shell = { componentDefinition: { m: { type: 'Menu' }, n: { type: 'Button' } } };

describe('stylePropertyComponentsFor', () => {
	it('lists the external components of one page', () => {
		expect(stylePropertyComponentsFor(page)).toEqual(['Button']);
	});

	it('lists those of a page and its shell once each', () => {
		expect(stylePropertyComponentsFor(page, shell)).toEqual(['Button', 'Menu']);
	});

	it('takes a missing definition as empty', () => {
		expect(stylePropertyComponentsFor(page, undefined)).toEqual(['Button']);
	});
});

describe('shellDefinitionFor', () => {
	const application = { properties: { shellPageDefinition: shell } };

	it('is the application shell for a page in the shell', () => {
		expect(shellDefinitionFor(application, page)).toBe(shell);
		expect(shellDefinitionFor(application, { properties: { wrapShell: true } })).toBe(shell);
	});

	it('is nothing for a page that opts out', () => {
		expect(shellDefinitionFor(application, { properties: { wrapShell: false } })).toBeUndefined();
	});
});

describe('componentTypesFor', () => {
	it('lists every type of a page and its shell once each', () => {
		const { componentTypesFor } = require('../stylePropertyComponents');
		expect(componentTypesFor(page, shell)).toEqual(['Button', 'Grid', 'Menu']);
		expect(componentTypesFor(undefined)).toEqual([]);
	});
});
