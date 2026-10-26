// ============================================================
// MentionResolverContext
//
// Lets the host inject a function that returns the *current* display label
// for a mention given its kind + id. The renderer falls back to the stored
// snapshot label when no resolver is provided or while the resolver is
// pending. A resolver that returns null signals that the target was deleted;
// the renderer shows the snapshot with a muted "(deleted)" suffix.
//
// The resolver may also return a fresh ReactNode to fully customize the
// pill body (avatar + name, page icon + title, etc.).
// ============================================================

import React, { createContext, useContext } from 'react';
import type { MentionKind } from '../core/types';

export interface ResolvedMention {
	/** Current display label. Pass through the snapshot when nothing to update. */
	label: string;
	/** Optional rich body to render inside the pill (avatar, icon, etc.). */
	body?: React.ReactNode;
}

/**
 * Synchronous resolver. Implementations typically read from an in-memory cache
 * populated by a React Query hook; missing entries return undefined and the
 * pill renders the snapshot label. Returning null = target deleted.
 */
export type MentionResolver = (kind: MentionKind, id: string) => ResolvedMention | null | undefined;

const MentionResolverCtx = createContext<MentionResolver | null>(null);

export function MentionResolverProvider(props: {
	value: MentionResolver;
	children: React.ReactNode;
}) {
	return (
		<MentionResolverCtx.Provider value={props.value}>
			{props.children}
		</MentionResolverCtx.Provider>
	);
}

export function useMentionResolver(): MentionResolver | null {
	return useContext(MentionResolverCtx);
}
