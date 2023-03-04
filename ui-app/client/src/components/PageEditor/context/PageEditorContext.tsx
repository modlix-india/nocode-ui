import React, { createContext, Dispatch, ReactNode, useReducer } from 'react';
import { PageDefinition } from '../../../types/common';

export interface PageEditorContext {
	undoQueue: Array<PageDefinition>;
	redoQueue: Array<PageDefinition>;
	preference: any;
	slaveView: any;
	tree: {
		openIds: Array<string>;
		highlighted: Array<string>;
		filter: string;
	};
}

export const defaultContext: PageEditorContext = {
	undoQueue: [],
	redoQueue: [],
	preference: {},
	slaveView: {},
	tree: {
		openIds: [],
		highlighted: [],
		filter: '',
	},
};

export interface ContextAction {
	type: string;
	payload: any;
}

export function contextReducer(state: PageEditorContext = defaultContext, action: ContextAction) {
	if (!action || !action.type) return state;

	return state;
}

const Context = createContext(defaultContext);
const DispatchContext = createContext<Dispatch<ContextAction> | undefined>(undefined);

export default function PageEditorContext({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(contextReducer, defaultContext);

	return (
		<Context.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
		</Context.Provider>
	);
}
