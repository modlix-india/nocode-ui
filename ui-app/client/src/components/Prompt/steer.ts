/**
 * Steering: a message sent while a turn is already running.
 *
 * One behaviour for every chat surface (the Prompt, the AI Studio board chat, the
 * Draft App floating prompt). POST /chat answers 409 for the whole length of a
 * run, because two agents interleaving tool calls and history writes on one
 * session corrupt both. So the message rides the run's control channel instead,
 * `POST <agent>/steer`, and the agent folds it into the SAME run at its next step
 * (between tool calls, or right after the answer it is writing). It is never a
 * second generation.
 *
 * Queued is not delivered. The agent emits a `steer` event once the text has
 * reached the model (`applied: true`), or hands it back (`applied: false`) when
 * the run stopped first. Text that never earns a verdict before the run ends was
 * never read, and goes back to the input box.
 *
 * Surfaces differ only in how they draw this, so the wire and the bookkeeping
 * live here and LazyPrompt, BoardChat and DraftAgent all call it.
 */

/** Shown on a queued message, the same words everywhere. */
export const QUEUED_NOTE = 'Queued. The agent reads this when it finishes its current step.';

export function newSteerId(): string {
	return `steer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * - `queued`: the run took it; wait for its `steer` event.
 * - `missed`: no run in progress (it ended between typing and sending). Nothing
 *   was lost: send it as an ordinary message once this surface sees the end.
 * - `failed`: refused or unreachable. Hand the text back to the box.
 */
export type SteerPost = 'queued' | 'missed' | 'failed';

export async function postSteer(opts: {
	baseUrl: string;
	headers: Record<string, string>;
	sessionId: string;
	text: string;
	steerId: string;
}): Promise<SteerPost> {
	try {
		const response = await fetch(`${opts.baseUrl}/steer`, {
			method: 'POST',
			headers: opts.headers,
			body: JSON.stringify({
				session_id: opts.sessionId,
				message: opts.text,
				steer_id: opts.steerId,
			}),
		});
		if (response.ok) return 'queued';
		return response.status === 404 ? 'missed' : 'failed';
	} catch {
		return 'failed';
	}
}

export interface SteerVerdict {
	id: string;
	text: string;
	applied: boolean;
	/** Sent from this surface (it was in the queue), not replayed or from another tab. */
	ours: boolean;
}

/**
 * The queue of one surface's steers, for a surface that has no transcript of its
 * own to keep them in (LazyPrompt keeps them as faded messages instead, with the
 * same three rules).
 */
export class SteerQueue {
	private pending = new Map<string, string>();

	add(id: string, text: string): void {
		this.pending.set(id, text);
	}

	drop(id: string): void {
		this.pending.delete(id);
	}

	get size(): number {
		return this.pending.size;
	}

	/** The texts still waiting, oldest first. */
	texts(): string[] {
		return Array.from(this.pending.values());
	}

	/** Read a `steer` event's data and settle the entry it names. */
	settle(data: any): SteerVerdict {
		const id = String(data?.id ?? '');
		const ours = this.pending.has(id);
		const text = String(data?.text ?? this.pending.get(id) ?? '');
		this.pending.delete(id);
		return { id, text, applied: data?.applied !== false, ours };
	}

	/** The run is over: whatever is still queued was never read. Empties the queue. */
	orphans(): string[] {
		const out = this.texts();
		this.pending.clear();
		return out;
	}
}
