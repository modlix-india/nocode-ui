/**
 * Attachments as the session history returns them, and as the transcript wants
 * them.
 *
 * Split out of LazyPrompt because the mapping has a rule in it worth testing on
 * its own: a turn row carries both what the user attached and what the agent
 * generated, and they belong on different messages.
 */

/** One attachment as `GET /sessions/{id}` returns it. */
export interface HistoryAttachment {
	id: number;
	kind: 'chat' | 'generated';
	type: 'image' | 'file';
	name: string;
	mime_type?: string;
	url: string;
	size_bytes?: number;
	expired?: boolean;
}

export interface Attachment {
	id: string;
	type: 'image' | 'file';
	name: string;
	/**
	 * What to render.
	 *
	 * For an attachment the user has just picked this is a `blob:` object URL
	 * over the local `File`, valid only for this document — a refresh and it is
	 * dead. For one replayed out of history it is the server path the file was
	 * stored at, which survives everything and is fetched on demand.
	 * `AttachmentThumb` is what tells the two apart.
	 */
	url: string;
	mimeType: string;
	file?: File;
	/**
	 * Set on attachments replayed from history. True once the file has passed
	 * the lifetime it was stored with and the retention job is entitled to have
	 * deleted it — a claim, not a guarantee, so the render also treats a failed
	 * fetch as the same state. Never set for a generated image: those are
	 * stored with no lifetime and do not expire.
	 */
	expired?: boolean;
	sizeBytes?: number;
}

function toAttachments(raw: HistoryAttachment[], prefix: string): Attachment[] {
	return raw.map((a, idx) => ({
		id: `${prefix}_${a.id ?? idx}`,
		type: a.type === 'file' ? 'file' : 'image',
		name: a.name,
		url: a.url,
		mimeType: a.mime_type ?? '',
		expired: a.expired,
		sizeBytes: a.size_bytes,
	}));
}

/**
 * Split one turn's attachments between the two messages it becomes.
 *
 * What the user attached goes back onto their own message; what a tool
 * generated goes onto the reply. Both arrive on the same history row because
 * both belong to the same turn, and putting a generated image above the
 * question that produced it would read as the user having supplied it.
 */
export function splitTurnAttachments(
	raw: HistoryAttachment[] | undefined,
	index: number,
): { user: Attachment[]; assistant: Attachment[] } {
	if (!raw?.length) return { user: [], assistant: [] };
	return {
		user: toAttachments(
			raw.filter(a => a.kind !== 'generated'),
			`hist_att_u_${index}`,
		),
		assistant: toAttachments(
			raw.filter(a => a.kind === 'generated'),
			`hist_att_a_${index}`,
		),
	};
}
