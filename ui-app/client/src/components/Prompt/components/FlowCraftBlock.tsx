import React, { useContext } from 'react';
import { AutomationDoc, AutomationRun, Catalog } from '../../AutomationFlow/automationTypes';
import { FlowView } from '../../AutomationFlow/FlowView';
import { CraftContext } from './craftContext';

/**
 * The `flow` craft block: an automation drawn with the same FlowView the
 * AutomationFlow page component uses.
 *
 * Contract (agreed with the agent side, `emit_craft` blocks):
 *   { type: "flow", automation, catalog?, run?, mode?: "view"|"run", appCode?,
 *     changed?: [nodeKey], actions?: [{ label, prompt }] }
 *
 * Inline in a message it is compact, with the agent's buttons (each sends its
 * prompt as the user's message) and an Open that moves it to the side panel.
 * Clicking a card puts `About the step "<title>": ` into the chat input.
 */
export interface FlowBlockProps {
	automation?: AutomationDoc;
	catalog?: Catalog;
	run?: AutomationRun;
	mode?: 'view' | 'run';
	appCode?: string;
	changed?: string[];
	actions?: Array<{ label: string; prompt: string }>;
}

export function aboutStep(doc: AutomationDoc | undefined, key: string, sentence: string): string {
	const title = doc?.nodes?.[key]?.title || sentence;
	return `About the step "${title}": `;
}

export default function FlowCraftBlock(props: Readonly<FlowBlockProps>) {
	const { automation, catalog, run, mode, appCode, changed, actions } = props;
	const ctx = useContext(CraftContext);
	const inline = !!ctx?.inline;
	const flowMode = mode === 'run' || (mode === undefined && run) ? 'run' : 'view';

	return (
		<div className={`_craftFlow${inline ? ' _inline' : ''}`}>
			<div className="comp compAutomationFlow _inChat">
				<FlowView
					doc={automation}
					catalog={catalog}
					run={flowMode === 'run' ? run : undefined}
					mode={flowMode}
					compact={inline}
					changed={changed}
					appCode={appCode ?? automation?.appCode}
					onCardClick={
						ctx?.onSeedInput
							? (key, sentence) =>
									ctx.onSeedInput!(aboutStep(automation, key, sentence))
							: undefined
					}
					emptyMessage="No automation to show."
				/>
			</div>
			{((actions?.length ?? 0) > 0 || (inline && ctx?.onOpenPanel)) && (
				<div className="_suggestions _craftFlowActions">
					{inline && ctx?.onOpenPanel && (
						<button
							type="button"
							className="_suggestionButton"
							onClick={ctx.onOpenPanel}
						>
							Open
						</button>
					)}
					{(actions ?? []).map((a, i) => (
						<button
							key={`${a.label}-${i}`}
							type="button"
							className="_suggestionButton"
							disabled={!ctx}
							onClick={() => ctx?.onSend(a.prompt, undefined, a.label)}
						>
							{a.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
