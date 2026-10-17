import { getDataFromPath } from '../../context/StoreContext';
import { ComponentDefinition, PageDefinition } from '../../types/common';

/**
 * What the person is looking at, said the way the page editor's sidekick says it
 * (`DnDSidekickBar`): `page 'deals' (id 66a1), with Table 'dealsTable' (key k1) selected`.
 * The agents already read that line as the subject of "this page" and "this table".
 */

export interface PickedComponent {
	key: string;
	type: string;
	name: string;
	/** The page the component belongs to: the page on screen, or the shell around it. */
	page: string;
}

interface PageRef {
	name: string;
	id?: string;
}

export interface OnScreen {
	/** The page the URL names; what `Store.urlDetails.pageName` and the editor's helpers go by. */
	urlPage: string;
	page?: PageDefinition;
	/** The shell, only when it actually wraps the page on screen. */
	shell?: PageDefinition;
}

/** The page on screen and its shell, read from the store now. */
export function readOnScreen(): OnScreen {
	const urlPage: string = getDataFromPath('Store.urlDetails.pageName', []) ?? '';
	const served: string = getDataFromPath('Store.urlDetails.servedPageName', []) || urlPage;
	const page: PageDefinition | undefined = served
		? getDataFromPath(`Store.pageDefinition.${served}`, [])
		: undefined;
	const shellDef: PageDefinition | undefined = getDataFromPath(
		'Store.application.properties.shellPageDefinition',
		[],
	);
	const wrapped = !!shellDef && page?.properties?.wrapShell !== false;
	return { urlPage, page, shell: wrapped ? shellDef : undefined };
}

const ref = (p?: PageDefinition): PageRef | undefined =>
	p?.name ? { name: p.name, id: (p as any).id } : undefined;

const pageLabel = (p: PageRef) => `page '${p.name}'${p.id ? ` (id ${p.id})` : ''}`;

/** Pure, so the wording can be tested. */
export function describeActiveObject(
	page: PageRef | undefined,
	shell: PageRef | undefined,
	picked: PickedComponent[],
): string {
	let out = page ? pageLabel(page) : '';
	if (page && shell && shell.name !== page.name) out += ` inside the shell ${pageLabel(shell)}`;
	if (!picked.length) return out;

	const parts = picked.map(c => {
		const label = `${c.type} '${c.name || c.key}' (key ${c.key})`;
		return shell && c.page === shell.name && c.page !== page?.name
			? `${label} on the shell page`
			: label;
	});
	const selected = `${parts.join(' and ')} selected`;
	return out ? `${out}, with ${selected}` : selected;
}

/** `active_object` for the page on screen now and what was picked on it. */
export function activeObjectNow(picked: PickedComponent[]): string {
	const { page, shell, urlPage } = readOnScreen();
	return describeActiveObject(
		ref(page) ?? (urlPage ? { name: urlPage } : undefined),
		ref(shell),
		picked,
	);
}

/**
 * Every component the picker may offer, keyed as the editor's helpers look them up.
 * The page's own win over the shell's on a clash, and the shell's `Page` slot is left
 * out: its overlay would cover the whole page and catch every click.
 */
export function pickableComponents(
	on: OnScreen,
): Record<string, { def: ComponentDefinition; page: string }> {
	const out: Record<string, { def: ComponentDefinition; page: string }> = {};
	for (const [k, def] of Object.entries(on.shell?.componentDefinition ?? {}))
		if (def && def.type !== 'Page') out[k] = { def, page: on.shell!.name };
	for (const [k, def] of Object.entries(on.page?.componentDefinition ?? {}))
		if (def) out[k] = { def, page: on.page!.name };
	return out;
}
