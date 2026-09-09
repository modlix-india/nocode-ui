import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Portal from '../components/Portal';
import { comboFromEvent, formatCombo, isApplePlatform } from './comboUtil';
import { currentLayer } from './layerStack';
import { shortcutRegistry } from './shortcutRegistry';

const OTHER_GROUP = 'Other';

interface Row {
	id: string;
	display: string;
	label: string;
}

/**
 * Press ? (or Mod+/) for a list of every shortcut live on this page.
 *
 * This reads the registry, so it costs nothing per component and it lists what no
 * chip can show: a bare-key shortcut, an icon only button, a headless Shortcut
 * component. It is also the affordance that scales, since a page with fifteen
 * shortcuts is undiscoverable by chips alone.
 */
export function ShortcutCheatSheet() {
	const [open, setOpen] = useState(false);
	const [version, setVersion] = useState(0);
	const panelRef = useRef<HTMLDivElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);

	const close = useCallback(() => setOpen(false), []);

	const buildGroups = useCallback(() => {

		const layer = currentLayer();
		const byGroup = new Map<string, Array<Row>>();
		const seen = new Set<string>();

		for (const reg of shortcutRegistry.all()) {
			if (reg.layer !== layer) continue;
			try {
				if (!reg.enabled()) continue;
			} catch {
				continue;
			}

			const display = formatCombo(reg.spec);
			if (!display) continue;

			// Repeated rows in an ArrayRepeater all claim the same combo and label;
			// listing fifty identical lines helps nobody.
			const dedupeKey = `${display}|${reg.label}`;
			if (seen.has(dedupeKey)) continue;
			seen.add(dedupeKey);

			const groupName = reg.group?.trim() || OTHER_GROUP;
			const rows = byGroup.get(groupName) ?? [];
			rows.push({ id: reg.id, display, label: reg.label });
			byGroup.set(groupName, rows);
		}

		return Array.from(byGroup.entries())
			.sort(([a], [b]) => {
				if (a === OTHER_GROUP) return 1;
				if (b === OTHER_GROUP) return -1;
				return a.localeCompare(b);
			})
			.map(([name, rows]) => ({
				name,
				rows: rows.sort((x, y) => x.label.localeCompare(y.label)),
			}));
	}, []);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (globalThis.designMode === 'PAGE') return;
			if (e.defaultPrevented || e.repeat || e.isComposing) return;

			if (open && e.key === 'Escape') {
				e.preventDefault();
				close();
				return;
			}

			// '?' is a display character, not a physical key: Shift+/ on US layouts and
			// somewhere else entirely elsewhere. This one binding therefore matches on
			// `key`, unlike every other shortcut in the system. Mod+/ is the stable alias.
			const isQuestionMark = e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey;
			const combo = comboFromEvent(e);
			const isModSlash = combo === (isApplePlatform() ? 'meta+/' : 'ctrl+/');

			if (!isQuestionMark && !isModSlash) return;

			// A bare '?' typed into a field is a question mark, not a command.
			if (isQuestionMark) {
				const target = e.target as HTMLElement | null;
				if (
					target?.isContentEditable ||
					target?.closest?.('input, textarea, select, [contenteditable="true"]')
				)
					return;
			}

			// Nothing to list means nothing to show. Swallow the key anyway when the
			// sheet is open (that is the close), but never pop an empty panel.
			if (!open && !buildGroups().length) return;

			e.preventDefault();
			e.stopPropagation();
			setOpen(current => !current);
		};

		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	}, [open, close, buildGroups]);

	useEffect(() => (open ? shortcutRegistry.subscribe(() => setVersion(v => v + 1)) : undefined), [
		open,
	]);

	useEffect(() => {
		if (!open) return;
		returnFocusRef.current = document.activeElement as HTMLElement | null;
		panelRef.current?.focus();
		return () => returnFocusRef.current?.focus?.();
	}, [open]);


	// `version` re-reads when a registration changes while the sheet is open.
	const groups = useMemo(() => (open ? buildGroups() : []), [open, buildGroups, version]);

	if (!open) return null;

	return (
		<Portal>
			<div className="_shortcutBackdrop" onClick={close}>
				<div
					ref={panelRef}
					className="_shortcutPanel _shortcutCheatSheetPanel"
					role="dialog"
					aria-modal="true"
					aria-label="Keyboard shortcuts"
					tabIndex={-1}
					onKeyDown={e => {
						if (e.key === 'Tab') e.preventDefault();
					}}
					onClick={e => e.stopPropagation()}
				>
					<div className="_shortcutPanelHeader">
						Keyboard shortcuts
						<span className="_shortcutKeyCap _headerEnd">Esc</span>
					</div>
					<div className="_shortcutCheatSheetBody">
						{groups.map(group => (
								<div className="_shortcutGroup" key={group.name}>
									<div className="_shortcutGroupHeader">{group.name}</div>
									{group.rows.map(row => (
										<div className="_shortcutRow" key={row.id}>
											<span className="_shortcutKeyCap">{row.display}</span>
											<span className="_shortcutRowLabel">{row.label}</span>
										</div>
									))}
							</div>
						))}
					</div>
				</div>
			</div>
		</Portal>
	);
}

export default ShortcutCheatSheet;
