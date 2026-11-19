import { createContext } from 'react';
import { LocationHistory, PageDefinition } from '../../../types/common';

/**
 * What a craft block can reach beyond its own fields. In its own module so a
 * block that lives in a separate (lazily loaded) file can read it without
 * importing CraftRenderer back.
 */
export interface CraftContextValue {
	sessionId: string | null;
	agentEndpoint: string;
	onSend: (text: string, attachments?: any[], displayText?: string) => Promise<void>;
	getAuthHeaders: () => Record<string, string>;
	/** Drawn inside a chat message rather than in the craft side panel. */
	inline?: boolean;
	/** Opens this craft in the side panel (offered by an inline block that needs room). */
	onOpenPanel?: () => void;
	/** Puts text into the chat input without sending it. */
	onSeedInput?: (text: string) => void;
	/** The page the chat sits on, for blocks that embed a page component (the KIRun editor). */
	host?: {
		context: { pageName: string; [key: string]: any };
		pageDefinition: PageDefinition;
		locationHistory: Array<LocationHistory>;
	};
}

export const CraftContext = createContext<CraftContextValue | null>(null);
