import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import {
	PageStoreExtractor,
	UrlDetailsExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
	setData as setStoreData,
} from '../../context/StoreContext';
import axios from 'axios';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { propertiesDefinition, stylePropertiesDefinition } from './promptProperties';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import { ChatMessage } from './components/ChatMessage';
import { ThinkingBlock } from './components/ThinkingBlock';
import { AgentGroup } from './components/AgentGroup';
import { ActionBlock, ConfirmationAction } from './components/ActionBlock';
import { InputBar } from './components/InputBar';
import { SessionList, Session } from './components/SessionList';
import { CraftCard } from './components/CraftCard';
import { CraftPanel } from './components/CraftPanel';
import type { CraftData } from './components/CraftPanel';
import { InlineDataRenderer } from './components/InlineDataRenderer';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	toolCalls?: ToolCall[];
	agentSpans?: AgentSpan[];
	attachments?: Attachment[];
	thinking?: string;
	turnNumber?: number;
	feedbackRating?: number; // -1 = thumbs down, 0 = neutral, 1 = thumbs up
	suggestions?: {
		options: Array<{ label: string; value: string }>;
		mode: 'single' | 'multi';
	};
	data?: Array<{ type: string; [k: string]: any }>;
	dataConfirmed?: boolean;
	dataConfirmedMeta?: Record<string, any>;
	craftIds?: string[];
	confirmationActions?: ConfirmationAction[];
}

interface ToolCall {
	id: string;
	toolName: string;
	displayName: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
	agentId?: string; // sub-agent that produced this tool call (if any)
	startedAt?: number;
	updates?: string[]; // accumulated tool_update messages (mini-log)
}

interface AgentSpan {
	agentId: string;
	label: string;
	parentId: string;
	parentToolUseId?: string;
	status: 'running' | 'success' | 'error';
	startedAt: number;
	endedAt?: number;
	durationMs?: number;
	tokensIn?: number;
	tokensOut?: number;
	stepCount?: number;
	summary?: string;
	toolCalls: ToolCall[];
	thinking?: string;
	statusText?: string; // live progress text from tool_update (e.g. "Analyzing results…")
}

interface Attachment {
	id: string;
	type: 'image' | 'file';
	name: string;
	url: string;
	mimeType: string;
	file?: File;
}

interface TokenUsage {
	input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	context_used: number;
	context_limit: number;
	context_percent: number;
	turns: number;
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			// Strip the data:...;base64, prefix — backend expects raw base64
			const base64 = result.split(',')[1] ?? result;
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function mapHistoryToMessages(history: any[]): Message[] {
	// Sort by turn_number ascending to guarantee chronological order
	const sorted = [...history].sort(
		(a, b) => (a.turn_number ?? 0) - (b.turn_number ?? 0),
	);
	const msgs: Message[] = [];
	for (let i = 0; i < sorted.length; i++) {
		const h = sorted[i];
		const turnNumber = h.turn_number ?? i + 1;
		if (h.user_instruction) {
			msgs.push({
				id: `hist_user_${i}`,
				role: 'user',
				content: h.user_instruction,
				turnNumber,
			});
		}
		if (h.assistant_summary) {
			const toolCalls: ToolCall[] = [];
			if (h.tool_calls_json) {
				try {
					const parsed = JSON.parse(h.tool_calls_json);
					for (const tc of parsed) {
						toolCalls.push({
							id: `hist_tc_${i}_${toolCalls.length}`,
							toolName: tc.tool ?? 'unknown',
							displayName: tc.display_name || tc.tool || 'unknown',
							summary: tc.summary ?? '',
							success: tc.success,
							isRunning: false,
						});
					}
				} catch {
					// Skip unparseable tool_calls_json
				}
			}
			msgs.push({
				id: `hist_asst_${i}`,
				role: 'assistant',
				content: h.assistant_summary,
				toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
				turnNumber,
				feedbackRating: h.feedback_rating,
			});
		}
	}
	return msgs;
}

interface SSEEventContext {
	assistantMsgId: string;
	currentText: string;
	toolCalls: Map<string, ToolCall>;
	agentSpans: Map<string, AgentSpan>;
	setText: (t: string) => void;
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
	setSessionId: (id: string | null) => void;
	setUsage: React.Dispatch<React.SetStateAction<TokenUsage | null>>;
	showToolCalls: boolean;
	setFeedbackTurn: (turn: { sessionId: string; turnNumber: number }) => void;
	setCrafts: React.Dispatch<React.SetStateAction<Map<string, CraftData>>>;
	setActiveCraftId: React.Dispatch<React.SetStateAction<string | null>>;
	setActiveCraft: React.Dispatch<React.SetStateAction<CraftData | null>>;
	onComplete?: string;
	completeBindingPath?: string;
	props: Readonly<ComponentProps>;
	runEvent: any;
}

// Helper: update the assistant message with current toolCalls + agentSpans state.
function flushMessageState(ctx: SSEEventContext) {
	const flatToolCalls = Array.from(ctx.toolCalls.values());
	const spans = Array.from(ctx.agentSpans.values());
	ctx.setMessages(prev =>
		prev.map(m =>
			m.id === ctx.assistantMsgId
				? { ...m, toolCalls: flatToolCalls, agentSpans: spans }
				: m,
		),
	);
}

function processSSEEvent(eventType: string, data: any, ctx: SSEEventContext) {
	switch (eventType) {
		case 'text': {
			const newText = ctx.currentText + (data.text ?? '');
			ctx.setText(newText);
			ctx.setMessages(prev =>
				prev.map(m =>
					m.id === ctx.assistantMsgId
						? { ...m, content: newText }
						: m,
				),
			);
			break;
		}
		case 'thinking': {
			const agentId = data.agent_id;
			const span = agentId ? ctx.agentSpans.get(agentId) : undefined;
			if (span) {
				span.thinking = (span.thinking ?? '') + (data.text ?? '');
				flushMessageState(ctx);
			} else {
				ctx.setMessages(prev =>
					prev.map(m =>
						m.id === ctx.assistantMsgId
							? { ...m, thinking: (m.thinking ?? '') + (data.text ?? '') }
							: m,
					),
				);
			}
			break;
		}
		case 'agent_started': {
			const agentId = data.agent_id;
			if (!agentId) break;
			ctx.agentSpans.set(agentId, {
				agentId,
				label: data.label ?? agentId,
				parentId: data.parent_id ?? 'root',
				parentToolUseId: data.parent_tool_use_id || undefined,
				status: 'running',
				startedAt: Date.now(),
				toolCalls: [],
			});
			flushMessageState(ctx);
			break;
		}
		case 'agent_finished': {
			const agentId = data.agent_id;
			const span = agentId ? ctx.agentSpans.get(agentId) : undefined;
			if (span) {
				span.status = data.status === 'error' ? 'error' : 'success';
				span.endedAt = Date.now();
				span.durationMs = data.duration_ms ?? span.endedAt - span.startedAt;
				span.tokensIn = data.tokens_in ?? 0;
				span.tokensOut = data.tokens_out ?? 0;
				span.stepCount = data.step_count ?? span.toolCalls.length;
				span.summary = data.summary ?? '';
				flushMessageState(ctx);
			}
			break;
		}
		case 'agent_usage': {
			const agentId = data.agent_id;
			const span = agentId ? ctx.agentSpans.get(agentId) : undefined;
			if (span) {
				span.tokensIn = data.tokens_in ?? span.tokensIn;
				span.tokensOut = data.tokens_out ?? span.tokensOut;
				flushMessageState(ctx);
			}
			break;
		}
		case 'tool_start': {
			if (!ctx.showToolCalls) break;
			const agentId = data.agent_id;
			const tc: ToolCall = {
				id: data.tool_use_id ?? `tc_${Date.now()}`,
				toolName: data.tool_name ?? 'unknown',
				displayName: data.display_name || data.tool_name || 'unknown',
				summary: '',
				isRunning: true,
				agentId,
				startedAt: Date.now(),
			};
			ctx.toolCalls.set(tc.id, tc);
			// If this tool belongs to a known sub-agent span, also nest it there.
			const span = agentId ? ctx.agentSpans.get(agentId) : undefined;
			if (span) span.toolCalls.push(tc);
			flushMessageState(ctx);
			break;
		}
		case 'tool_update': {
			if (!ctx.showToolCalls) break;
			const tuId = data.tool_use_id ?? '';
			const msg = data.message ?? '';
			// Check if this update targets a parent tool that spawned an agent.
			// If so, show it as the agent's live status text.
			let routed = false;
			for (const [, span] of ctx.agentSpans) {
				if (span.parentToolUseId && span.parentToolUseId === tuId && span.status === 'running') {
					span.statusText = msg;
					routed = true;
					flushMessageState(ctx);
					break;
				}
			}
			if (!routed) {
				const tuTc = ctx.toolCalls.get(tuId);
				if (tuTc && tuTc.isRunning) {
					// Accumulate updates as a mini-log for expanded view.
					// Don't replace summary — that's set by tool_result only.
					if (!tuTc.updates) tuTc.updates = [];
					tuTc.updates.push(msg);
					flushMessageState(ctx);
				}
			}
			break;
		}
		case 'tool_result': {
			if (!ctx.showToolCalls) break;
			const tcId = data.tool_use_id ?? '';
			const existing = ctx.toolCalls.get(tcId);
			if (existing) {
				existing.summary = data.summary ?? '';
				existing.success = data.success;
				existing.isRunning = false;
				flushMessageState(ctx);
			}
			break;
		}
		case 'done': {
			if (data.session_id) {
				ctx.setSessionId(data.session_id);
			}
			if (data.usage) {
				const u = data.usage;
				const input = u.input_tokens ?? 0;
				const output = u.output_tokens ?? 0;
				const contextUsed = u.context_used ?? 0;
				const contextLimit = u.context_limit ?? 48000;
				const contextPercent =
					u.context_percent ??
					(contextLimit > 0
						? Math.min(Math.round((contextUsed / contextLimit) * 100), 100)
						: 0);
				ctx.setUsage({
					input_tokens: input,
					output_tokens: output,
					total_tokens: u.total_tokens ?? input + output,
					context_used: contextUsed,
					context_limit: contextLimit,
					context_percent: contextPercent,
					turns: u.turns ?? 0,
				});
			}
			break;
		}
		case 'feedback_request': {
			const fbSessionId = data.session_id;
			const fbTurnNumber = data.turn_number ?? 0;
			if (fbSessionId) {
				ctx.setFeedbackTurn({ sessionId: fbSessionId, turnNumber: fbTurnNumber });
				ctx.setMessages(prev =>
					prev.map(m =>
						m.id === ctx.assistantMsgId
							? { ...m, turnNumber: fbTurnNumber }
							: m,
					),
				);
			}
			break;
		}
		case 'suggestions': {
			const options = data.options ?? [];
			const mode = data.mode ?? 'single';
			if (options.length > 0) {
				ctx.setMessages(prev =>
					prev.map(m =>
						m.id === ctx.assistantMsgId
							? { ...m, suggestions: { options, mode } }
							: m,
					),
				);
			}
			break;
		}
		case 'data': {
			if (data?.type) {
				ctx.setMessages(prev =>
					prev.map(m =>
						m.id === ctx.assistantMsgId
							? { ...m, data: [...(m.data ?? []), data as any] }
							: m,
					),
				);
			}
			break;
		}
		case 'complete': {
			// Automatically update the store if a binding path is provided
			if (ctx.completeBindingPath) {
				setData(
					ctx.completeBindingPath,
					data,
					ctx.props.context.pageName,
				);
			}

			if (ctx.onComplete) {
				const completeEvent =
					ctx.props.pageDefinition.eventFunctions?.[ctx.onComplete];
				if (completeEvent) {
					ctx.runEvent(
						completeEvent,
						ctx.onComplete,
						ctx.props.context.pageName,
						ctx.props.locationHistory,
						ctx.props.pageDefinition,
					);
				}
			}
			break;
		}
		case 'craft': {
			const craftId = data.id;
			if (craftId) {
				const isAppend = data.append === true;
				const textDelta = data.text_delta;
				const newBlocks = data.blocks ?? [];

				ctx.setCrafts(prev => {
					const next = new Map(prev);
					let craft: CraftData;

					if (textDelta && next.has(craftId)) {
						// Stream text into the last text block (or create one)
						const existing = next.get(craftId)!;
						const blocks = [...existing.blocks];
						// Remove callout if present (summary is starting)
						const lastBlock = blocks[blocks.length - 1];
						if (lastBlock?.type === 'callout') {
							blocks.pop();
						}
						// Append to existing text block or create new one
						const lastTextBlock = blocks[blocks.length - 1];
						if (lastTextBlock?.type === 'text') {
							blocks[blocks.length - 1] = {
								...lastTextBlock,
								content: lastTextBlock.content + textDelta,
							};
						} else {
							blocks.push({ type: 'text', content: textDelta });
						}
						craft = { ...existing, blocks };
					} else if (isAppend && next.has(craftId)) {
						// Append blocks to existing craft
						const existing = next.get(craftId)!;
						craft = {
							...existing,
							title: data.title ?? existing.title,
							blocks: [...existing.blocks, ...newBlocks],
						};
					} else {
						// Create or replace craft
						craft = {
							id: craftId,
							title: data.title ?? 'Craft',
							blocks: newBlocks,
							message_id: data.message_id ?? ctx.assistantMsgId,
						};
					}

					next.set(craftId, craft);
					ctx.setActiveCraft(craft);
					return next;
				});

				ctx.setActiveCraftId(craftId);

				// Link craft to the assistant message (avoid duplicates)
				ctx.setMessages(prev =>
					prev.map(m => {
						if (m.id !== ctx.assistantMsgId) return m;
						const existing = m.craftIds ?? [];
						if (existing.includes(craftId)) return m;
						return { ...m, craftIds: [...existing, craftId] };
					}),
				);
			}
			break;
		}
		case 'confirmation_request': {
			// Capture session_id early so handleActionResponse can POST /confirm
			// before the stream ends (session_id is normally set in the 'done' event)
			if (data.session_id) {
				ctx.setSessionId(data.session_id);
			}
			const action: ConfirmationAction = {
				confirmationId: data.confirmation_id ?? '',
				message: data.message ?? '',
				toolName: data.tool_name ?? '',
				displayName: data.display_name ?? '',
				details: data.details ?? {},
				options: Array.isArray(data.options)
					? data.options
					: [
							{ label: 'Approve', value: 'approve' },
							{ label: 'Deny', value: 'deny' },
						],
				toolUseId: data.tool_use_id ?? '',
				status: 'pending',
			};
			ctx.setMessages(prev =>
				prev.map(m =>
					m.id === ctx.assistantMsgId
						? {
								...m,
								confirmationActions: [
									...(m.confirmationActions ?? []),
									action,
								],
							}
						: m,
				),
			);
			break;
		}
		case 'error': {
			const errText =
				ctx.currentText + `\n\n*Error: ${data.message ?? 'Unknown error'}*`;
			ctx.setText(errText);
			ctx.setMessages(prev =>
				prev.map(m =>
					m.id === ctx.assistantMsgId ? { ...m, content: errText } : m,
				),
			);
			break;
		}
	}
}

function SuggestionButtons({
	suggestions,
	onSelect,
	disabled,
}: Readonly<{
	suggestions: NonNullable<Message['suggestions']>;
	onSelect: (text: string, attachments?: Attachment[], displayText?: string) => void;
	disabled: boolean;
}>) {
	const [selected, setSelected] = React.useState<Set<string>>(new Set());

	if (suggestions.mode === 'single') {
		return (
			<div className="_suggestions">
				{suggestions.options.map(opt => (
					<button
						key={opt.value}
						className="_suggestionButton"
						onClick={() => onSelect(opt.value, undefined, opt.label)}
						disabled={disabled}
						type="button"
					>
						{opt.label}
					</button>
				))}
			</div>
		);
	}

	// Multi-select mode
	const handleToggle = (value: string) => {
		setSelected(prev => {
			const next = new Set(prev);
			if (next.has(value)) next.delete(value);
			else next.add(value);
			return next;
		});
	};

	const handleConfirm = () => {
		if (selected.size === 0) return;
		const picked = suggestions.options.filter(o => selected.has(o.value));
		const sendText = picked.map(o => o.value).join(', ');
		const displayText = picked.map(o => o.label).join(', ');
		onSelect(sendText, undefined, displayText);
	};

	return (
		<div className="_suggestions">
			{suggestions.options.map(opt => (
				<button
					key={opt.value}
					className={`_suggestionButton${selected.has(opt.value) ? ' _selected' : ''}`}
					onClick={() => handleToggle(opt.value)}
					disabled={disabled}
					type="button"
				>
					{opt.label}
				</button>
			))}
			{selected.size > 0 && (
				<button
					className="_suggestionButton _suggestionsConfirm"
					onClick={handleConfirm}
					disabled={disabled}
					type="button"
				>
					Confirm
				</button>
			)}
		</div>
	);
}

function extractUsageFromSession(session: any): TokenUsage | null {
	if (!session) return null;
	const input = session.total_input_tokens ?? 0;
	const output = session.total_output_tokens ?? 0;
	const contextUsed = session.context_tokens_used ?? 0;
	const contextLimit = session.context_limit ?? 48000;
	const contextPercent =
		contextLimit > 0 ? Math.round((contextUsed / contextLimit) * 100) : 0;
	if (input === 0 && output === 0 && (session.turn_count ?? 0) === 0) return null;
	return {
		input_tokens: input,
		output_tokens: output,
		total_tokens: input + output,
		context_used: contextUsed,
		context_limit: contextLimit,
		context_percent: Math.min(contextPercent, 100),
		turns: session.turn_count ?? 0,
	};
}

function getContextLevel(percent: number): string {
	if (percent >= 90) return ' _critical';
	if (percent >= 70) return ' _warning';
	return '';
}

function UsageBar({ usage }: Readonly<{ usage: TokenUsage }>) {
	const contextClass = `_usageContext${getContextLevel(usage.context_percent)}`;
	return (
		<div className="_usageBar">
			<span className="_usageTokens">
				{usage.total_tokens.toLocaleString()} tokens
			</span>
			<span className="_usageSeparator" />
			<span className="_usageTurns">
				{usage.turns} {usage.turns === 1 ? 'turn' : 'turns'}
			</span>
			<span className="_usageSeparator" />
			<span className={contextClass}>{usage.context_percent}% context</span>
			<div className="_usageContextBar">
				<div
					className="_usageContextFill"
					style={{ width: `${Math.min(usage.context_percent, 100)}%` }}
				/>
			</div>
		</div>
	);
}

function ModelSelector({
	models,
	selectedModel,
	onSelectModel,
	disabled,
}: Readonly<{
	models: { id: string; name: string }[];
	selectedModel: string;
	onSelectModel: (id: string) => void;
	disabled: boolean;
}>) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const selectedLabel =
		models.find(m => m.id === selectedModel)?.name ?? 'Auto';

	return (
		<div className="_modelSelector" ref={ref}>
			<button
				className="_modelSelectorButton"
				onClick={() => !disabled && setOpen(o => !o)}
				disabled={disabled}
				type="button"
			>
				<span className="_modelSelectorLabel">{selectedLabel}</span>
				<i className="fa fa-chevron-down _modelSelectorChevron" />
			</button>
			{open && (
				<div className="_modelSelectorDropdown">
					<button
						className={`_modelSelectorOption${!selectedModel ? ' _active' : ''}`}
						onClick={() => {
							onSelectModel('');
							setOpen(false);
						}}
						type="button"
					>
						<span className="_modelOptionName">Auto</span>
						{!selectedModel && <i className="fa fa-check _modelOptionCheck" />}
					</button>
					{models.map(m => (
						<button
							key={m.id}
							className={`_modelSelectorOption${selectedModel === m.id ? ' _active' : ''}`}
							onClick={() => {
								onSelectModel(m.id);
								setOpen(false);
							}}
							type="button"
						>
							<span className="_modelOptionName">{m.name}</span>
							{selectedModel === m.id && (
								<i className="fa fa-check _modelOptionCheck" />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default function LazyPrompt(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const [hover, setHover] = useState(false);

	const {
		key,
		properties: {
			agentEndpoint = '/api/ai/appbuilder/chat',
			completeBindingPath,
			placeholder = 'Ask anything',
			welcomeMessage = 'What can I help with?',
			showSessions = true,
			newChatLabel = 'New chat',
			yourChatsLabel = 'Your chats',
			deleteConfirmMessage = 'Delete this chat? This action cannot be undone.',
			showModelSelector = false,
			selectedProviders = [],
			showToolCalls = true,
			enablePersonalization = true,
			sessionsPerPage = 20,
			messagesPerPage = 20,
			sidebarToggleIcon = 'fa fa-bars',
			newChatTopIcon = 'fa fa-pen-to-square',
			newChatSidebarIcon = 'fa fa-plus',
			sendIcon = 'fa fa-arrow-up',
			stopIcon = 'fa fa-stop',
			addAttachmentIcon = 'fa fa-plus',
			removeAttachmentIcon = 'fa fa-xmark',
			fileIcon = 'fa fa-file',
			copyIcon = 'fa fa-clone',
			copySuccessIcon = 'fa fa-check',
			renameIcon = 'fa fa-pen',
			deleteIcon = 'fa fa-trash',
			toolRunningIcon = 'fa fa-circle-notch fa-spin',
			toolSuccessIcon = 'fa fa-check',
			toolErrorIcon = 'fa fa-xmark',
			expandIcon = 'fa fa-chevron-down',
			collapseIcon = 'fa fa-chevron-up',
			enableVoiceInput = true,
			microphoneIcon = 'fa fa-microphone',
			microphoneActiveIcon = 'fa fa-stop',
			enableFeedback = true,
			thumbsUpIcon = 'fa fa-thumbs-up',
			thumbsDownIcon = 'fa fa-thumbs-down',
			quickActionLayout = '_list',
			quickActionLabels = [],
			quickActionPrompts = [],
			quickActionIcons = [],
			readOnly,
			onMessage,
			onError,
			onComplete,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const resolvedPlaceholder = getTranslations(
		placeholder,
		props.pageDefinition.translations,
	);

	const resolvedWelcomeMessage = getTranslations(
		welcomeMessage,
		props.pageDefinition.translations,
	);

	const resolvedNewChatLabel = getTranslations(
		newChatLabel,
		props.pageDefinition.translations,
	);

	const resolvedYourChatsLabel = getTranslations(
		yourChatsLabel,
		props.pageDefinition.translations,
	);

	const resolvedDeleteConfirmMessage = getTranslations(
		deleteConfirmMessage,
		props.pageDefinition.translations,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const [messages, setMessages] = useState<Message[]>([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const [sessionId, _setSessionId] = useState<string | null>(null);
	const sessionIdRef = useRef<string | null>(null);
	const setSessionId = useCallback((id: string | null) => {
		sessionIdRef.current = id;
		_setSessionId(id);
	}, []);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [feedbackTurn, setFeedbackTurn] = useState<{ sessionId: string; turnNumber: number } | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [usage, setUsage] = useState<TokenUsage | null>(null);

	// Craft panel state
	const [crafts, setCrafts] = useState<Map<string, CraftData>>(new Map());
	const [activeCraftId, setActiveCraftId] = useState<string | null>(null);
	const [activeCraft, setActiveCraft] = useState<CraftData | null>(null);

	// Model selector state
	const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>('');

	const filteredModels = useMemo(() => {
		if (!selectedProviders.length) return availableModels;
		const providerSet = new Set(selectedProviders.map((p: string) => p.toLowerCase()));
		return availableModels.filter(m => providerSet.has(m.id.split(':')[0]));
	}, [availableModels, selectedProviders]);

	// Session pagination state
	const [totalSessions, setTotalSessions] = useState(0);
	const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);

	// Message pagination state
	const [totalMessages, setTotalMessages] = useState(0);
	const [messagesOffset, setMessagesOffset] = useState(0);
	const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

	// Draft state
	const [draftText, setDraftText] = useState('');
	const saveDraftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const shouldAutoScrollRef = useRef(true);
	const wasNewSessionRef = useRef(false);

	// Polling for PROCESSING sessions
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Sidebar resize state
	const [sidebarWidth, setSidebarWidth] = useState(260);
	const isResizingRef = useRef(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	// Personalization: persist sidebar width
	const personalizationBindingPath = enablePersonalization
		? `${STORE_PREFIX}.personalization.${props.context.pageName}.${flattenUUID(key)}`
		: undefined;

	useEffect(() => {
		if (!personalizationBindingPath) return;

		const appCode = getDataFromPath(
			`${STORE_PREFIX}.application.appCode`,
			props.locationHistory,
			pageExtractor,
		);
		const url = `api/ui/personalization/${appCode}/prompt_${pageExtractor.getPageName()}_${key}`;
		let currentObject: any;

		(async () => {
			try {
				const po = await axios.get(url, {
					headers: {
						Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
					},
				});
				if (po.data) {
					setStoreData(
						personalizationBindingPath,
						po.data,
						pageExtractor.getPageName(),
					);
					if (po.data.sidebarWidth) {
						setSidebarWidth(po.data.sidebarWidth);
					}
					if (po.data.sidebarOpen !== undefined) {
						setSidebarOpen(po.data.sidebarOpen);
					}
				}
				currentObject = duplicate(po.data);
			} catch {
				// Silently fail — personalization is optional
			}
		})();

		let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
		const unsub = addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => {
				if (timeoutHandle) clearTimeout(timeoutHandle);
				if (deepEqual(currentObject, v) || currentObject === undefined) return;
				currentObject = duplicate(v);

				timeoutHandle = setTimeout(() => {
					(async () => {
						try {
							await axios.post(url, v, {
								headers: {
									Authorization: getDataFromPath(
										`${LOCAL_STORE_PREFIX}.AuthToken`,
										[],
									),
								},
							});
						} catch {
							// Silently fail
						}
						timeoutHandle = undefined;
					})();
				}, 2000);
			},
			personalizationBindingPath,
		);

		return unsub;
	}, [personalizationBindingPath]);

	// Sidebar resize handlers
	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			isResizingRef.current = true;

			const startX = e.clientX;
			const startWidth = sidebarWidth;

			const handleMouseMove = (ev: MouseEvent) => {
				if (!isResizingRef.current) return;
				const newWidth = Math.max(180, Math.min(500, startWidth + (ev.clientX - startX)));
				setSidebarWidth(newWidth);
			};

			const handleMouseUp = () => {
				if (!isResizingRef.current) return;
				isResizingRef.current = false;
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
				document.body.style.cursor = '';
				document.body.style.userSelect = '';

				// Save to personalization
				if (personalizationBindingPath) {
					const current =
						getDataFromPath(
							personalizationBindingPath,
							props.locationHistory,
							pageExtractor,
						) ?? {};
					setStoreData(
						personalizationBindingPath,
						{ ...current, sidebarWidth: sidebarRef.current?.offsetWidth ?? sidebarWidth },
						pageExtractor.getPageName(),
					);
				}
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		},
		[sidebarWidth, personalizationBindingPath, props.locationHistory, pageExtractor],
	);

	// Sidebar toggle with personalization
	const handleSidebarToggle = useCallback(() => {
		setSidebarOpen(prev => {
			const newOpen = !prev;
			if (personalizationBindingPath) {
				const current =
					getDataFromPath(
						personalizationBindingPath,
						props.locationHistory,
						pageExtractor,
					) ?? {};
				setStoreData(
					personalizationBindingPath,
					{ ...current, sidebarOpen: newOpen },
					pageExtractor.getPageName(),
				);
			}
			return newOpen;
		});
	}, [personalizationBindingPath, props.locationHistory, pageExtractor]);

	const getAuthHeaders = useCallback(() => {
		const token = getDataFromPath('Store.auth.token', [], pageExtractor) ?? '';
		const clientCode =
			getDataFromPath('Store.auth.clientCode', [], pageExtractor) ?? '';
		const appCode =
			getDataFromPath(
				`${STORE_PREFIX}.application.appCode`,
				props.locationHistory,
				pageExtractor,
			) ?? '';
		return {
			'Content-Type': 'application/json',
			Authorization: token ? `Bearer ${token}` : '',
			clientCode: clientCode as string,
			appCode: appCode as string,
		};
	}, [pageExtractor, props.locationHistory]);

	// Fetch sessions list
	const fetchSessions = useCallback(async () => {
		try {
			const baseUrl = agentEndpoint.replace(/\/chat$/, '');
			const response = await fetch(
				`${baseUrl}/sessions?limit=${sessionsPerPage}`,
				{ headers: getAuthHeaders() },
			);
			if (response.ok) {
				const data = await response.json();
				let items: Session[] = [];
				if (Array.isArray(data)) items = data;
				else if (Array.isArray(data?.items)) items = data.items;
				setSessions(items);
				setTotalSessions(data?.total ?? items.length);
			}
		} catch {
			// Silently fail - sessions are optional
		}
	}, [agentEndpoint, getAuthHeaders, sessionsPerPage]);

	useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	// Fetch available models when model selector is enabled
	useEffect(() => {
		if (!showModelSelector) return;
		(async () => {
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const response = await fetch(`${baseUrl}/models`, {
					headers: getAuthHeaders(),
				});
				if (response.ok) {
					const data = await response.json();
					const models = Array.isArray(data?.models) ? data.models : [];
					setAvailableModels(models);
				}
			} catch {
				// Silently fail — model selector is optional
			}
		})();
	}, [showModelSelector, agentEndpoint, getAuthHeaders]);

	// Auto-scroll to bottom on new messages (but not when loading earlier)
	useEffect(() => {
		if (shouldAutoScrollRef.current) {
			requestAnimationFrame(() => {
				const container = messagesContainerRef.current;
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			});
		}
		shouldAutoScrollRef.current = true;
	}, [messages]);

	// Restore draft when session changes — but NOT while streaming,
	// because the `done` event updates sessionId and would wipe
	// whatever the user typed in the input while waiting.
	const isStreamingRef = useRef(isStreaming);
	isStreamingRef.current = isStreaming;
	useEffect(() => {
		if (isStreamingRef.current) return;
		const draftKey = sessionId ?? '_new';
		const draft = getDataFromPath(
			`LocalStore.promptDrafts.${draftKey}`,
			[],
			pageExtractor,
		);
		setDraftText(draft?.text ?? '');
	}, [sessionId, pageExtractor]);

	// Load more sessions
	const handleLoadMoreSessions = useCallback(async () => {
		if (loadingMoreSessions) return;
		setLoadingMoreSessions(true);
		try {
			const newOffset = sessions.length;
			const baseUrl = agentEndpoint.replace(/\/chat$/, '');
			const response = await fetch(
				`${baseUrl}/sessions?limit=${sessionsPerPage}&offset=${newOffset}`,
				{ headers: getAuthHeaders() },
			);
			if (response.ok) {
				const data = await response.json();
				const newItems: Session[] = Array.isArray(data?.items)
					? data.items
					: [];
				setSessions(prev => [...prev, ...newItems]);
				setTotalSessions(data?.total ?? totalSessions);
			}
		} catch {
			// Silently fail
		} finally {
			setLoadingMoreSessions(false);
		}
	}, [
		loadingMoreSessions,
		sessions.length,
		agentEndpoint,
		sessionsPerPage,
		getAuthHeaders,
		totalSessions,
	]);

	// Stop polling for a PROCESSING session
	const stopPolling = useCallback(() => {
		if (pollingRef.current) {
			clearInterval(pollingRef.current);
			pollingRef.current = null;
		}
	}, []);

	// Start polling a PROCESSING session for updates
	const startPolling = useCallback(
		(pollSessionId: string) => {
			stopPolling();
			setIsStreaming(true);

			const poll = async () => {
				try {
					const baseUrl = agentEndpoint.replace(/\/chat$/, '');
					const response = await fetch(
						`${baseUrl}/sessions/${pollSessionId}?limit=${messagesPerPage}&offset=0`,
						{ headers: getAuthHeaders() },
					);
					if (!response.ok) return;

					const data = await response.json();
					const history = Array.isArray(data.history)
						? data.history
						: [];
					setMessages(mapHistoryToMessages(history));
					setTotalMessages(data.total_history ?? history.length);
					setUsage(extractUsageFromSession(data.session));

					const status = data.session?.status;
					if (status !== 'PROCESSING') {
						stopPolling();
						setIsStreaming(false);
						fetchSessions();
					}
				} catch {
					// Will retry on next interval
				}
			};

			poll();
			pollingRef.current = setInterval(poll, 3000);
		},
		[agentEndpoint, getAuthHeaders, messagesPerPage, stopPolling, fetchSessions],
	);

	// Select a session and load its history
	const handleSelectSession = useCallback(
		async (selectedSessionId: string) => {
			stopPolling();
			setIsStreaming(false);

			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const response = await fetch(
					`${baseUrl}/sessions/${selectedSessionId}?limit=${messagesPerPage}&offset=0`,
					{ headers: getAuthHeaders() },
				);
				if (response.ok) {
					const data = await response.json();
					setSessionId(selectedSessionId);

					const history = Array.isArray(data.history)
						? data.history
						: [];
					setMessages(mapHistoryToMessages(history));
					setTotalMessages(data.total_history ?? history.length);
					setMessagesOffset(0);
					setUsage(extractUsageFromSession(data.session));

					// If session is currently being processed and was recently
					// updated, poll for updates. Stale PROCESSING sessions
					// (e.g. server crashed or stop was hit) are treated as done.
					if (data.session?.status === 'PROCESSING') {
						const updatedAt = data.session?.updated_at;
						const isStale = updatedAt &&
							(Date.now() - new Date(updatedAt).getTime() > 60_000);
						if (!isStale) {
							startPolling(selectedSessionId);
						}
					}
				}
			} catch {
				// Silently fail
			}
		},
		[agentEndpoint, getAuthHeaders, messagesPerPage, stopPolling, startPolling],
	);

	const handleNewChat = useCallback(() => {
		stopPolling();
		setIsStreaming(false);
		setSessionId(null);
		setMessages([]);
		setUsage(null);
		setTotalMessages(0);
		setMessagesOffset(0);
		setFeedbackTurn(null);
	}, [stopPolling]);

	// Delete a session
	const handleDeleteSession = useCallback(
		async (deleteSessionId: string) => {
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				await fetch(`${baseUrl}/sessions/${deleteSessionId}`, {
					method: 'DELETE',
					headers: getAuthHeaders(),
				});
				setSessions(prev =>
					prev.filter(s => s.session_id !== deleteSessionId),
				);
				setTotalSessions(prev => Math.max(0, prev - 1));
				// If the deleted session was active, clear chat
				if (sessionId === deleteSessionId) {
					setSessionId(null);
					setMessages([]);
					setTotalMessages(0);
					setMessagesOffset(0);
				}
			} catch {
				// Silently fail
			}
		},
		[agentEndpoint, getAuthHeaders, sessionId],
	);

	// Rename a session
	const handleRenameSession = useCallback(
		async (renameSessionId: string, newTitle: string) => {
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const response = await fetch(
					`${baseUrl}/sessions/${renameSessionId}`,
					{
						method: 'PATCH',
						headers: getAuthHeaders(),
						body: JSON.stringify({ title: newTitle }),
					},
				);
				if (response.ok) {
					setSessions(prev =>
						prev.map(s =>
							s.session_id === renameSessionId
								? { ...s, title: newTitle }
								: s,
						),
					);
				}
			} catch {
				// Silently fail
			}
		},
		[agentEndpoint, getAuthHeaders],
	);

	// Load earlier messages
	const handleLoadEarlierMessages = useCallback(async () => {
		if (loadingMoreMessages || !sessionId) return;
		setLoadingMoreMessages(true);

		const container = messagesContainerRef.current;
		const prevScrollHeight = container?.scrollHeight ?? 0;

		try {
			const newOffset = messagesOffset + messagesPerPage;
			const baseUrl = agentEndpoint.replace(/\/chat$/, '');
			const response = await fetch(
				`${baseUrl}/sessions/${sessionId}?limit=${messagesPerPage}&offset=${newOffset}`,
				{ headers: getAuthHeaders() },
			);
			if (response.ok) {
				const data = await response.json();
				const olderMessages = mapHistoryToMessages(
					data.history ?? [],
				);

				shouldAutoScrollRef.current = false;
				setMessages(prev => [...olderMessages, ...prev]);
				setMessagesOffset(newOffset);
				setTotalMessages(data.total_history ?? totalMessages);

				// Preserve scroll position after prepending
				requestAnimationFrame(() => {
					if (container) {
						const newScrollHeight = container.scrollHeight;
						container.scrollTop =
							newScrollHeight - prevScrollHeight;
					}
				});
			}
		} catch {
			// Silently fail
		} finally {
			setLoadingMoreMessages(false);
		}
	}, [
		loadingMoreMessages,
		sessionId,
		messagesOffset,
		messagesPerPage,
		agentEndpoint,
		getAuthHeaders,
		totalMessages,
	]);

	// Draft change handler (debounced save to localStorage)
	const handleDraftChange = useCallback(
		(text: string) => {
			setDraftText(text);
			if (saveDraftTimeoutRef.current) {
				clearTimeout(saveDraftTimeoutRef.current);
			}
			saveDraftTimeoutRef.current = setTimeout(() => {
				const draftKey = sessionId ?? '_new';
				if (text.trim()) {
					setData(
						`LocalStore.promptDrafts.${draftKey}`,
						{ text },
						props.context.pageName,
					);
				} else {
					setData(
						`LocalStore.promptDrafts.${draftKey}`,
						undefined,
						props.context.pageName,
					);
				}
			}, 500);
		},
		[sessionId, props.context.pageName],
	);

	const handleSend = useCallback(
		async (text: string, attachments?: Attachment[], displayText?: string) => {
			if (isStreaming || readOnly) return;
			stopPolling();

			wasNewSessionRef.current = sessionId === null;

			const userMsg: Message = {
				id: `user_${Date.now()}`,
				role: 'user',
				content: displayText ?? text,
				attachments,
			};
			setMessages(prev => [...prev, userMsg]);
			setIsStreaming(true);

			// Clear draft — cancel any pending debounce first
			if (saveDraftTimeoutRef.current) {
				clearTimeout(saveDraftTimeoutRef.current);
				saveDraftTimeoutRef.current = null;
			}
			const draftKey = sessionId ?? '_new';
			setDraftText('');
			setData(
				`LocalStore.promptDrafts.${draftKey}`,
				undefined,
				props.context.pageName,
			);

			const headers = getAuthHeaders();
			let streamTimedOut = false;
			let receivedSessionId = sessionId;

			try {
				abortControllerRef.current = new AbortController();

				const body: any = {
					message: text,
					session_id: sessionId,
					...(selectedModel ? { model: selectedModel } : {}),
				};

				if (attachments?.length) {
					body.attachments = await Promise.all(
						attachments.map(async a => {
							const att: any = {
								type: a.type,
								name: a.name,
								mime_type: a.mimeType,
							};
							if (a.file) {
								att.data = await fileToBase64(a.file);
							}
							return att;
						}),
					);
				}

				const response = await fetch(agentEndpoint, {
					method: 'POST',
					headers,
					body: JSON.stringify(body),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const reader = response.body?.getReader();
				if (!reader) throw new Error('No response body');

				const decoder = new TextDecoder();
				let buffer = '';
				let assistantText = '';
				const toolCalls = new Map<string, ToolCall>();
				const agentSpans = new Map<string, AgentSpan>();
				const assistantMsgId = `asst_${Date.now()}`;

				setMessages(prev => [
					...prev,
					{ id: assistantMsgId, role: 'assistant', content: '', toolCalls: [], agentSpans: [] },
				]);

				// Watchdog: detect dead connections (server keepalives every 15s)
				const STREAM_TIMEOUT_MS = 45_000;
				let lastDataAt = Date.now();
				const watchdog = setInterval(() => {
					if (Date.now() - lastDataAt > STREAM_TIMEOUT_MS) {
						streamTimedOut = true;
						abortControllerRef.current?.abort();
						clearInterval(watchdog);
					}
				}, 5_000);

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						lastDataAt = Date.now();

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split('\n');
						buffer = lines.pop() ?? '';

						let eventType = '';

						for (const line of lines) {
							if (line.startsWith('event: ')) {
								eventType = line.slice(7).trim();
							} else if (line.startsWith('data: ') && eventType) {
								try {
									const data = JSON.parse(line.slice(6));
									if (eventType === 'done' && data.session_id) {
										receivedSessionId = data.session_id;
									}
									processSSEEvent(eventType, data, {
										assistantMsgId,
										currentText: assistantText,
										toolCalls,
										agentSpans,
										setText: (newText: string) => {
											assistantText = newText;
										},
										setMessages,
										setSessionId,
										setUsage,
										showToolCalls,
										setFeedbackTurn: (turn) => setFeedbackTurn(turn),
										setCrafts,
										setActiveCraftId,
										setActiveCraft,
										onComplete,
										completeBindingPath,
										props,
										runEvent,
									});
								} catch {
									// Skip unparseable data
								}
								eventType = '';
							} else if (line === '') {
								eventType = '';
							}
						}
					}
				} finally {
					clearInterval(watchdog);
				}

				// If stream timed out, fall back to polling the session
				if (streamTimedOut && receivedSessionId) {
					startPolling(receivedSessionId);
					return;
				}

				// Refresh sessions after a message exchange
				await fetchSessions();

				if (onMessage) {
					const messageEvent =
						props.pageDefinition.eventFunctions?.[onMessage];
					if (messageEvent) {
						await runEvent(
							messageEvent,
							onMessage,
							props.context.pageName,
							props.locationHistory,
							props.pageDefinition,
						);
					}
				}
			} catch (err: any) {
				if (err.name === 'AbortError') {
					// Timeout-triggered abort: fall back to polling the session
					if (streamTimedOut && receivedSessionId) {
						startPolling(receivedSessionId);
					}
					return;
				}

				const errorMsg: Message = {
					id: `err_${Date.now()}`,
					role: 'assistant',
					content: `Error: ${err.message ?? 'Connection failed'}`,
				};
				setMessages(prev => [...prev, errorMsg]);

				if (onError) {
					const errorEvent = props.pageDefinition.eventFunctions?.[onError];
					if (errorEvent) {
						await runEvent(
							errorEvent,
							onError,
							props.context.pageName,
							props.locationHistory,
							props.pageDefinition,
						);
					}
				}
			} finally {
				setIsStreaming(false);
				abortControllerRef.current = null;
			}
		},
		[
			isStreaming,
			readOnly,
			agentEndpoint,
			sessionId,
			selectedModel,
			showToolCalls,
			onMessage,
			onError,
			onComplete,
			completeBindingPath,
			getAuthHeaders,
			fetchSessions,
			startPolling,
			stopPolling,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		],
	);

	const handleStop = useCallback(() => {
		abortControllerRef.current?.abort();
		stopPolling();
		setIsStreaming(false);
		abortControllerRef.current = null;

		// Tell the backend to stop the agent loop
		const sid = sessionIdRef.current;
		if (sid) {
			const baseUrl = agentEndpoint.replace(/\/chat$/, '');
			fetch(`${baseUrl}/stop`, {
				method: 'POST',
				headers: getAuthHeaders(),
				body: JSON.stringify({ session_id: sid }),
			}).catch(() => {});
		}
	}, [stopPolling, agentEndpoint, getAuthHeaders]);

	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
			stopPolling();
			if (saveDraftTimeoutRef.current) {
				clearTimeout(saveDraftTimeoutRef.current);
			}
		};
	}, [stopPolling]);

	// Feedback handler — calls POST /api/ai/learning/feedback
	const handleFeedback = useCallback(
		async (messageId: string, turnNumber: number, rating: number) => {
			const targetSessionId = sessionId ?? feedbackTurn?.sessionId;
			if (!targetSessionId || !enableFeedback) return;

			// Optimistically update the message's feedback rating
			setMessages(prev =>
				prev.map(m =>
					m.id === messageId ? { ...m, feedbackRating: rating } : m,
				),
			);

			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '').replace(/\/appbuilder$/, '');
				await fetch(`${baseUrl}/learning/feedback`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify({
						session_id: targetSessionId,
						turn_number: turnNumber,
						rating,
						feedback_type: 'RATING',
					}),
				});
			} catch {
				// Revert on failure
				setMessages(prev =>
					prev.map(m =>
						m.id === messageId ? { ...m, feedbackRating: undefined } : m,
					),
				);
			}
		},
		[sessionId, feedbackTurn, enableFeedback, agentEndpoint, getAuthHeaders],
	);

	// Confirmation response handler — updates action status and sends choice to POST /confirm
	const handleActionResponse = useCallback(
		async (confirmationId: string, approved: boolean, selectedValue: string) => {
			const sid = sessionIdRef.current;
			if (!sid) return;

			// Optimistically update the action status on the message
			const newStatus = approved ? 'approved' : 'denied';
			setMessages(prev =>
				prev.map(m => ({
					...m,
					confirmationActions: m.confirmationActions?.map(a =>
						a.confirmationId === confirmationId
							? { ...a, status: newStatus as ConfirmationAction['status'], selectedValue }
							: a,
					),
				})),
			);

			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				await fetch(`${baseUrl}/confirm`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify({
						confirmation_id: confirmationId,
						session_id: sid,
						approved,
						selected: selectedValue,
					}),
				});
			} catch {
				// If the confirm POST fails, the backend will timeout and auto-deny
			}
		},
		[agentEndpoint, getAuthHeaders],
	);

	const hasEarlierMessages =
		totalMessages > 0 && messagesOffset + messagesPerPage < totalMessages;

	return (
		<div
			className="comp compPrompt"
			style={styleProperties.comp ?? {}}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<HelperComponent context={props.context} definition={props.definition} />

			{showSessions && (
				<SessionList
					sessions={sessions}
					activeSessionId={sessionId}
					onSelectSession={handleSelectSession}
					onNewChat={handleNewChat}
					onDeleteSession={handleDeleteSession}
					onRenameSession={handleRenameSession}
					isOpen={sidebarOpen}
					onToggle={handleSidebarToggle}
					definition={props.definition}
					styleProperties={styleProperties}
					hasMore={sessions.length < totalSessions}
					loadingMore={loadingMoreSessions}
					onLoadMore={handleLoadMoreSessions}
					newChatLabel={resolvedNewChatLabel ?? newChatLabel}
					yourChatsLabel={resolvedYourChatsLabel ?? yourChatsLabel}
					deleteConfirmMessage={resolvedDeleteConfirmMessage ?? deleteConfirmMessage}
					sidebarWidth={sidebarWidth}
					sidebarRef={sidebarRef}
					onResizeStart={handleResizeStart}
					newChatSidebarIcon={newChatSidebarIcon}
					renameIcon={renameIcon}
					deleteIcon={deleteIcon}
				/>
			)}

			<div className={`_promptMain${messages.length === 0 && !hasEarlierMessages ? ' _promptEmpty' : ''}${activeCraftId ? ' _hasCraft' : ''}`}>
				<div className="_promptTopBar">
					<button
						className="_sidebarToggle"
						onClick={handleSidebarToggle}
						title="Toggle sessions"
					>
						<i className={sidebarToggleIcon} />
					</button>
					{sessionId && (
						<button
							className="_newChatTopButton"
							onClick={handleNewChat}
							title="New chat"
						>
							<i className={newChatTopIcon} />
						</button>
					)}
				</div>

				<div
					className="_promptMessages"
					ref={messagesContainerRef}
					style={styleProperties.messagesContainer ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="messagesContainer"
					/>
					<div className="_promptMessagesInner">
						{hasEarlierMessages && (
							<button
								className="_loadEarlierMessages"
								onClick={handleLoadEarlierMessages}
								disabled={loadingMoreMessages}
							>
								{loadingMoreMessages
									? 'Loading...'
									: 'Load earlier messages'}
							</button>
						)}
						{messages.length === 0 && !hasEarlierMessages && (
							<div className="_emptyState">
								<h2 className="_emptyTitle">
									{resolvedWelcomeMessage ?? welcomeMessage}
								</h2>
							</div>
						)}
						{messages.map(msg => (
							<React.Fragment key={msg.id}>
								{msg.attachments?.length ? (
									<div className="_messageAttachments">
										{msg.attachments.map(att => (
											<div
												key={att.id}
												className="_attachmentPreview"
											>
												{att.type === 'image' ? (
													<img
														src={att.url}
														alt={att.name}
														className="_attachmentImage"
													/>
												) : (
													<div className="_attachmentFile">
														<i className={fileIcon} />
														<span>{att.name}</span>
													</div>
												)}
											</div>
										))}
									</div>
								) : null}
								{msg.role === 'assistant' && (() => {
									// 1. Tools owned by a sub-agent render
									//    inside that agent's row, not the
									//    orchestrator's group.
									// 2. Tools that *spawned* an agent
									//    (parent_tool_use_id) are suppressed
									//    from the orchestrator group — the
									//    agent row replaces them.
									const subAgentToolIds = new Set<string>();
									const spawnToolIds = new Set<string>();
									for (const sp of msg.agentSpans ?? []) {
										for (const tc of sp.toolCalls) subAgentToolIds.add(tc.id);
										if (sp.parentToolUseId) spawnToolIds.add(sp.parentToolUseId);
									}
									const orchestratorToolCalls = (msg.toolCalls ?? []).filter(
										tc => !subAgentToolIds.has(tc.id) && !spawnToolIds.has(tc.id),
									);
									// Render blocks in chronological order —
									// whichever happened first appears first.
									const firstToolAt = orchestratorToolCalls
										.map(tc => tc.startedAt ?? Infinity)
										.reduce((a, b) => Math.min(a, b), Infinity);
									const firstAgentAt = (msg.agentSpans ?? [])
										.map(sp => sp.startedAt ?? Infinity)
										.reduce((a, b) => Math.min(a, b), Infinity);
									const agentsFirst = firstAgentAt < firstToolAt;

									// Hide the thinking indicator while an agent is running —
									// the agent's pulsing dot already signals activity.
									const anyAgentRunning = (msg.agentSpans ?? []).some(
										sp => sp.status === 'running',
									);
									const thinkingBlock = (
										<ThinkingBlock
											isActive={
												!anyAgentRunning &&
												isStreaming &&
												msg.id === messages.at(-1)?.id &&
												(!msg.content ||
													(msg.toolCalls?.some(
														tc => tc.isRunning,
													) ??
														false))
											}
											toolCalls={
												showToolCalls
													? orchestratorToolCalls
													: []
											}
											reasoningContent={msg.thinking}
											toolRunningIcon={toolRunningIcon}
											toolSuccessIcon={toolSuccessIcon}
											toolErrorIcon={toolErrorIcon}
											expandIcon={expandIcon}
											collapseIcon={collapseIcon}
										/>
									);
									const agentGroup = (msg.agentSpans ?? []).length > 0 ? (
										<AgentGroup
											spans={msg.agentSpans ?? []}
											expandIcon={expandIcon}
											collapseIcon={collapseIcon}
										/>
									) : null;
									return (
										<>
											{agentsFirst ? (
												<>
													{agentGroup}
													{thinkingBlock}
												</>
											) : (
												<>
													{thinkingBlock}
													{agentGroup}
												</>
											)}
										</>
									);
								})()}
								<ChatMessage
									role={msg.role}
									content={msg.content}
									componentKey={key ?? ''}
									styles={styleProperties}
									isStreaming={
										isStreaming &&
										msg.role === 'assistant' &&
										msg.id === messages.at(-1)?.id
									}
									definition={props.definition}
									copyIcon={copyIcon}
									copySuccessIcon={copySuccessIcon}
									enableFeedback={!!enableFeedback}
									feedbackRating={msg.feedbackRating}
									turnNumber={msg.turnNumber}
									messageId={msg.id}
									onFeedback={handleFeedback}
									thumbsUpIcon={thumbsUpIcon}
									thumbsDownIcon={thumbsDownIcon}
								>
									{msg.suggestions && !isStreaming && (
										<SuggestionButtons
											suggestions={msg.suggestions}
											onSelect={handleSend}
											disabled={isStreaming || msg.id !== messages.at(-1)?.id}
										/>
									)}
									{msg.data?.map((payload, i) => (
										<InlineDataRenderer
											key={`${msg.id}-data-${i}`}
											payload={payload}
											confirmed={msg.dataConfirmed}
											confirmedMeta={msg.dataConfirmedMeta}
											disabled={isStreaming || msg.id !== messages.at(-1)?.id}
											onRespond={(sendText, displayText, meta) => {
												setMessages(prev =>
													prev.map(m =>
														m.id === msg.id
															? { ...m, dataConfirmed: true, dataConfirmedMeta: meta }
															: m,
													),
												);
												handleSend(sendText, undefined, displayText);
											}}
										/>
									))}
								</ChatMessage>
								{msg.confirmationActions?.map(action => (
									<ActionBlock
										key={action.confirmationId}
										action={action}
										onRespond={handleActionResponse}
									/>
								))}
							</React.Fragment>
						))}
						{isStreaming && messages.at(-1)?.role === 'user' && (
							<ThinkingBlock
								isActive={true}
								toolCalls={[]}
								toolRunningIcon={toolRunningIcon}
								toolSuccessIcon={toolSuccessIcon}
								toolErrorIcon={toolErrorIcon}
								expandIcon={expandIcon}
								collapseIcon={collapseIcon}
							/>
						)}
						<div ref={messagesEndRef} />
					</div>
				</div>

				{crafts.size > 0 && !activeCraftId && (
					<div className="_craftCardsBar">
						{Array.from(crafts.values()).map(c => {
							const subtitle = c.blocks.find(
								(b: any) => b.type === 'badge',
							)?.label;
							return (
								<CraftCard
									key={c.id}
									title={c.title}
									subtitle={subtitle}
									onClick={() => { setActiveCraftId(c.id); setActiveCraft(c); }}
									definition={props.definition}
									styleProperties={styleProperties}
								/>
							);
						})}
					</div>
				)}
				<div className="_promptInputWrapper">
					<InputBar
						placeholder={resolvedPlaceholder ?? placeholder}
						disabled={!!readOnly}
						isStreaming={isStreaming}
						onSend={handleSend}
						onStop={handleStop}
						definition={props.definition}
						styleProperties={styleProperties}
						initialText={draftText}
						onTextChange={handleDraftChange}
						sendIcon={sendIcon}
						stopIcon={stopIcon}
						addAttachmentIcon={addAttachmentIcon}
						removeAttachmentIcon={removeAttachmentIcon}
						fileIcon={fileIcon}
						enableVoiceInput={enableVoiceInput}
						microphoneIcon={microphoneIcon}
						microphoneActiveIcon={microphoneActiveIcon}
					/>
					<div className="_promptBottomBar">
						{showModelSelector && filteredModels.length > 0 && (
							<ModelSelector
								models={filteredModels}
								selectedModel={selectedModel}
								onSelectModel={setSelectedModel}
								disabled={isStreaming}
							/>
						)}
						{usage && <UsageBar usage={usage} />}
					</div>
				</div>

				{messages.length === 0 && !hasEarlierMessages && quickActionLabels.length > 0 && (
					<div className={`_quickActions ${quickActionLayout}`} role="group" aria-label="Quick actions">
						{quickActionLabels.map((label: string, i: number) => {
							const prompt = quickActionPrompts[i] ?? '';
							const icon = quickActionIcons[i] ?? '';
							const isDisabled = !prompt;
							if (!label) return null;
							return (
								<button
									key={i}
									className={`_quickActionItem${isDisabled ? ' _quickActionDisabled' : ''}`}
									onClick={isDisabled ? undefined : () => handleSend(prompt)}
									disabled={isDisabled || isStreaming}
									type="button"
									aria-label={isDisabled ? `${label} - coming soon` : label}
								>
									{icon && <i className={`${icon} _quickActionIcon`} aria-hidden="true" />}
									<span className="_quickActionLabel">{label}</span>
									{isDisabled && (
										<span className="_quickActionBadge" aria-hidden="true">Soon</span>
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>
			{activeCraft && (
				<CraftPanel
					craft={activeCraft}
					onClose={() => { setActiveCraftId(null); setActiveCraft(null); }}
					definition={props.definition}
					styleProperties={styleProperties}
				/>
			)}
		</div>
	);
}
