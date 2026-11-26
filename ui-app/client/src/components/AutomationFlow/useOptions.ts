import { useEffect, useMemo, useState } from 'react';
import { loadOptions, stableArgs } from './automationApi';
import { AutomationDoc, Catalog, OptionsRef, PickOption } from './automationTypes';
import { findAction, findTrigger, OptionLabeller } from './sentences';

const refKey = (r: OptionsRef) => `${r.namespace}.${r.name}`;

/**
 * The options one picker offers and whether the list for the current args has
 * arrived. Re-fetches when the args change; until a list arrives for them the
 * answer is empty (a field without args behaves as it always did).
 */
export function useOptionsState(
	ref: OptionsRef | undefined,
	appCode?: string,
	args?: Record<string, any>,
): { opts: PickOption[]; loaded: boolean } {
	const key = `${ref ? refKey(ref) : ''}|${stableArgs(args)}`;
	const [state, setState] = useState<{ key: string; opts: PickOption[] }>({ key, opts: [] });
	useEffect(() => {
		if (!ref) {
			setState({ key, opts: [] });
			return;
		}
		let live = true;
		loadOptions(ref, appCode, args).then(o => live && setState({ key, opts: o }));
		return () => {
			live = false;
		};
	}, [key, appCode]);
	const loaded = !!ref && state.key === key;
	return { opts: state.key === key ? state.opts : [], loaded };
}

/** The options one picker offers; empty until (and unless) the function answers. */
export function useOptions(
	ref: OptionsRef | undefined,
	appCode?: string,
	args?: Record<string, any>,
): PickOption[] {
	return useOptionsState(ref, appCode, args).opts;
}

/**
 * Labels for option values on the cards ("t_123" -> "Welcome to Skyline").
 *
 * Collects every options function the document actually uses (the params of
 * its actions, the trigger's and wait events' filter fields), fetches each once
 * and answers a labeller. Until a list arrives a chip shows the raw value.
 */
export function useOptionLabels(
	doc: AutomationDoc | undefined,
	catalog: Catalog | undefined,
	appCode?: string,
): OptionLabeller {
	const wanted = useMemo(() => {
		const byName = new Map<string, OptionsRef>();
		const trig = findTrigger(catalog, doc?.trigger?.key);
		for (const f of trig?.fields ?? [])
			if (f.options) byName.set(`trigger.${f.name}`, f.options);
		for (const node of Object.values(doc?.nodes ?? {})) {
			if (node?.type === 'ACTION') {
				const act = findAction(catalog, node.action);
				for (const p of act?.params ?? [])
					if (p.options && node.params?.[p.name] !== undefined && !byName.has(p.name))
						byName.set(p.name, p.options);
			}
			if (node?.type === 'WAIT' && node.untilEvent) {
				const ev = findTrigger(catalog, node.untilEvent.key);
				for (const f of ev?.fields ?? [])
					if (f.options) byName.set(`event.${f.name}`, f.options);
			}
		}
		return byName;
	}, [doc, catalog]);

	const [lists, setLists] = useState<Record<string, PickOption[]>>({});
	const signature = Array.from(wanted.values()).map(refKey).sort().join('|');

	useEffect(() => {
		let live = true;
		const refs = new Map<string, OptionsRef>();
		for (const r of wanted.values()) refs.set(refKey(r), r);
		for (const [k, r] of refs) {
			if (lists[k]) continue;
			loadOptions(r, appCode).then(o => {
				if (live && o.length) setLists(prev => ({ ...prev, [k]: o }));
			});
		}
		return () => {
			live = false;
		};
	}, [signature, appCode]);

	return useMemo<OptionLabeller>(
		() => (name, value) => {
			const r = wanted.get(name);
			if (!r) return undefined;
			const found = lists[refKey(r)]?.find(o => String(o.value) === String(value));
			return found?.label;
		},
		[wanted, lists],
	);
}
