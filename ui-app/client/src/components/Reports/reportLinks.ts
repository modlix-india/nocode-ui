import type React from 'react';
import { CatalogLink, ReportCatalog, ReportFilter, ReportPeriod, ReportSpec } from './reportTypes';

/**
 * Click-through (CONTRACT 8.0): row links, "View all", KPI count links. A link is an app relative
 * path template; placeholders are filled from the clicked row, the run's single selected filter
 * values and its resolved period. Links are UI navigation only: the target page applies its own
 * access rules.
 */

export interface LinkContext {
	/** The clicked row (row key placeholders). */
	row?: Record<string, any>;
	/** `{filter.<field>}`: the single selected value per field. */
	filters?: Record<string, any>;
	/** `{period.from}` / `{period.to}`. */
	period?: ReportPeriod;
}

const PLACEHOLDER = /\{([^{}]*)\}/g;

function isEmpty(v: any) {
	return v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);
}

function day(v: any): string | undefined {
	const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''));
	return m ? m[1] : undefined;
}

/** True for a placeholder that reads the row (anything but `filter.` and `period.`). */
export function isRowKey(name: string): boolean {
	return !name.startsWith('filter.') && !name.startsWith('period.');
}

/** The placeholder names in a template, in order. */
export function placeholdersOf(path: string | undefined): string[] {
	return [...String(path ?? '').matchAll(PLACEHOLDER)].map(m => m[1].trim());
}

function valueOf(name: string, ctx: LinkContext): any {
	if (name.startsWith('filter.')) return ctx.filters?.[name.slice('filter.'.length)];
	if (name === 'period.from') return day(ctx.period?.from);
	if (name === 'period.to') return day(ctx.period?.to);
	if (name.startsWith('period.')) return undefined;
	return name ? ctx.row?.[name] : undefined;
}

/** The template with every placeholder filled (URI encoded); unknown or empty ones become ''. */
export function fillLink(path: string, ctx: LinkContext): string {
	return String(path ?? '').replace(PLACEHOLDER, (_, raw: string) => {
		const v = valueOf(raw.trim(), ctx);
		if (isEmpty(v) || typeof v === 'object') return '';
		return encodeURIComponent(String(v));
	});
}

/**
 * A row's link, or undefined when the row lacks a key the template needs (an aggregated row
 * has no case id, so a chart bar of "cases by RM" is not a link to one case).
 */
export function rowLinkOf(
	link: CatalogLink | undefined,
	row: Record<string, any> | undefined,
	ctx?: Omit<LinkContext, 'row'>,
): string | undefined {
	if (!link?.path || !row) return undefined;
	const names = placeholdersOf(link.path).filter(isRowKey);
	if (names.some(n => isEmpty(row[n]))) return undefined;
	return fillLink(link.path, { ...ctx, row });
}

/**
 * Field -> value for every field the run narrows to exactly one value: EQ with one value, IN
 * with one value, and (function sources) a set parameter. Dashboard quick filters are already
 * in the effective spec, so they count too.
 */
export function singleValues(spec: ReportSpec | undefined): Record<string, any> {
	const out: Record<string, any> = {};
	for (const [k, v] of Object.entries(spec?.params ?? {}))
		if (!isEmpty(v) && typeof v !== 'object') out[k] = v;
	const seen = new Map<string, number>();
	for (const f of spec?.filters ?? []) seen.set(f.field, (seen.get(f.field) ?? 0) + 1);
	for (const f of spec?.filters ?? ([] as ReportFilter[])) {
		if (f.period || (seen.get(f.field) ?? 0) > 1) continue;
		if ((f.op === 'EQ' || f.op === 'IN') && f.values?.length === 1 && !isEmpty(f.values[0]))
			out[f.field] = f.values[0];
	}
	return out;
}

/** The count link of a KPI: the default widget's, else its segment's. */
export function countLinkOf(
	catalog: ReportCatalog | undefined,
	spec: ReportSpec | undefined,
	defaultId?: string,
): CatalogLink | undefined {
	if (!catalog || !spec) return undefined;
	const def = defaultId ? catalog.defaults?.find(d => d.id === defaultId) : undefined;
	if (def?.countLink?.path) return def.countLink;
	const seg = spec.segment ? catalog.sources?.[spec.source]?.segments?.[spec.segment] : undefined;
	return seg?.countLink?.path ? seg.countLink : undefined;
}

export type Navigator = (path: string, newTab?: boolean) => void;

/** Opens an app relative path the way the Navigate step does (functions/Navigate.ts). */
export const openInApp: Navigator = (path, newTab) => {
	import('../../functions/navigateTo').then(
		m => m.navigateTo(path, newTab ? { target: '_blank' } : undefined),
		() => {},
	);
};

/** Props for an element that opens a link on click or Enter / Space (keyboard accessible). */
export function linkProps(
	href: string | undefined,
	navigate: Navigator,
	label?: string,
): React.HTMLAttributes<HTMLElement> & { role?: string; tabIndex?: number } {
	if (!href) return {};
	return {
		role: 'link',
		tabIndex: 0,
		title: label,
		'aria-label': label,
		onClick: (e: React.MouseEvent) => {
			e.stopPropagation();
			navigate(href, !!(e.metaKey || e.ctrlKey));
		},
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key !== 'Enter' && e.key !== ' ') return;
			e.preventDefault();
			e.stopPropagation();
			navigate(href, !!(e.metaKey || e.ctrlKey));
		},
	};
}
