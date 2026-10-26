// ============================================================
// MentionProvider — pluggable data source for the @-mention picker.
//
// Each provider owns one kind (page, user, date, record, …). The editor
// merges results from all providers passed via <BlockEditor mentionProviders>.
// Providers are normal objects; the editor never instantiates anything.
// Date is fully client-side; pages/users/records call the host's API client.
// ============================================================

import type { MentionKind } from '../core/types';

export type { MentionKind };

export interface MentionItem {
	kind: MentionKind;
	/**
	 * Stable target id. For dates this is the ISO yyyy-mm-dd string;
	 * for records it is "<databaseId>:<rowId>".
	 */
	id: string;
	/** Display label captured at insert time (frozen into the mention mark). */
	label: string;
	/** Secondary line in the picker row (path, email, etc.). */
	description?: string;
	/** Optional avatar / favicon URL shown in the picker row. */
	iconUrl?: string;
	/** Single-char icon (emoji) shown when iconUrl is absent — e.g. page emoji. */
	iconChar?: string;
	/**
	 * When set, the picker defers insertion and runs a sub-flow before
	 * calling `onSelect`. The sub-flow updates the item's id (and optionally
	 * label) before insertion.
	 *
	 *  - `"date"` opens an inline calendar; picked ISO becomes the id.
	 *  - `"create_page"` / `"create_contact"` dispatch the
	 *    `mde-mention-create` window event to ask the host to create the
	 *    resource, then insert with the resulting real UUID. The freeform
	 *    provider uses these for its "Add as page" / "Add as contact" rows.
	 */
	prompt?: 'date' | 'create_page' | 'create_contact';
	/**
	 * Picker section override. By default items are grouped by `kind` via the
	 * picker's KIND_LABELS map ("Pages", "Contacts", "People"…). Setting this
	 * forces the item into a custom section regardless of kind — used by the
	 * freeform provider to keep its three differently-kinded quick actions
	 * (Use freely=person, Add as page=page, Add as contact=contact) under a
	 * single "Quick actions" heading.
	 */
	section?: string;
}

export interface MentionContext {
	/** Host-injected workspace scope for backend calls. */
	workspaceId?: string;
	/** Block the user is typing in — useful for record-provider scoping. */
	blockId?: string;
	/** AbortSignal that fires when the filter changes or the picker closes. */
	signal?: AbortSignal;
}

export interface MentionProvider {
	/** Mark kind written into the inserted mention's attrs. */
	kind: MentionKind;
	/** Group heading shown in the picker (e.g. "Pages"). */
	label: string;
	/**
	 * Optional gate by filter shape — used by the date provider so it only
	 * appears when the filter looks date-ish. Defaults to always-on.
	 */
	match?: (filter: string) => boolean;
	/** Async fetch of suggestions for the current filter. Should respect signal. */
	search: (filter: string, ctx: MentionContext) => Promise<MentionItem[]>;
	/**
	 * Optional async lookup for the *current* label of a stored mention. Used
	 * by MentionResolverContext consumers. Returning null marks the target as
	 * deleted; returning undefined keeps the snapshot label.
	 */
	resolve?: (id: string, ctx: MentionContext) => Promise<{ label: string } | null | undefined>;
}
