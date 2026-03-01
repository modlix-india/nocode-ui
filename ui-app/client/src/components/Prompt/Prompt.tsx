import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Component,
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
import PromptStyle from './PromptStyle';
import { styleDefaults, stylePropertiesForTheme } from './promptStyleProperties';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import { ChatMessage } from './components/ChatMessage';
import { ThinkingBlock } from './components/ThinkingBlock';
import { InputBar } from './components/InputBar';
import { SessionList, Session } from './components/SessionList';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	toolCalls?: ToolCall[];
	attachments?: Attachment[];
}

interface ToolCall {
	id: string;
	toolName: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
}

interface Attachment {
	id: string;
	type: 'image' | 'file';
	name: string;
	url: string;
	mimeType: string;
	file?: File;
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
		if (h.user_instruction) {
			msgs.push({
				id: `hist_user_${i}`,
				role: 'user',
				content: h.user_instruction,
			});
		}
		if (h.assistant_summary) {
			msgs.push({
				id: `hist_asst_${i}`,
				role: 'assistant',
				content: h.assistant_summary,
			});
		}
	}
	return msgs;
}

function PromptComponent(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const [hover, setHover] = useState(false);

	const {
		key,
		properties: {
			agentEndpoint = '/api/ai/appbuilder/chat',
			placeholder = 'Ask anything',
			welcomeMessage = 'What can I help with?',
			showSessions = true,
			newChatLabel = 'New chat',
			yourChatsLabel = 'Your chats',
			deleteConfirmMessage = 'Delete this chat? This action cannot be undone.',
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
			readOnly,
			onMessage,
			onError,
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
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [sidebarOpen, setSidebarOpen] = useState(true);

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

	// Restore draft when session changes
	useEffect(() => {
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

	// Select a session and load its history
	const handleSelectSession = useCallback(
		async (selectedSessionId: string) => {
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
				}
			} catch {
				// Silently fail
			}
		},
		[agentEndpoint, getAuthHeaders, messagesPerPage],
	);

	const handleNewChat = useCallback(() => {
		setSessionId(null);
		setMessages([]);
		setTotalMessages(0);
		setMessagesOffset(0);
	}, []);

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
		async (text: string, attachments?: Attachment[]) => {
			if (isStreaming || readOnly) return;

			wasNewSessionRef.current = sessionId === null;

			const userMsg: Message = {
				id: `user_${Date.now()}`,
				role: 'user',
				content: text,
				attachments,
			};
			setMessages(prev => [...prev, userMsg]);
			setIsStreaming(true);

			// Clear draft
			const draftKey = sessionId ?? '_new';
			setDraftText('');
			setData(
				`LocalStore.promptDrafts.${draftKey}`,
				undefined,
				props.context.pageName,
			);

			const headers = getAuthHeaders();

			try {
				abortControllerRef.current = new AbortController();

				const body: any = {
					message: text,
					session_id: sessionId,
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
				const assistantMsgId = `asst_${Date.now()}`;

				setMessages(prev => [
					...prev,
					{ id: assistantMsgId, role: 'assistant', content: '', toolCalls: [] },
				]);

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

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
								processSSEEvent(
									eventType,
									data,
									assistantMsgId,
									assistantText,
									toolCalls,
									(newText: string) => {
										assistantText = newText;
									},
									setMessages,
									setSessionId,
									showToolCalls,
								);
							} catch {
								// Skip unparseable data
							}
							eventType = '';
						} else if (line === '') {
							eventType = '';
						}
					}
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
				if (err.name === 'AbortError') return;

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
			showToolCalls,
			onMessage,
			onError,
			getAuthHeaders,
			fetchSessions,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		],
	);

	const handleStop = useCallback(() => {
		abortControllerRef.current?.abort();
		setIsStreaming(false);
		abortControllerRef.current = null;
	}, []);

	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
			if (saveDraftTimeoutRef.current) {
				clearTimeout(saveDraftTimeoutRef.current);
			}
		};
	}, []);

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

			<div className="_promptMain">
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
								{msg.role === 'assistant' && (
									<ThinkingBlock
										isActive={
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
												? msg.toolCalls ?? []
												: []
										}
										toolRunningIcon={toolRunningIcon}
										toolSuccessIcon={toolSuccessIcon}
										toolErrorIcon={toolErrorIcon}
										expandIcon={expandIcon}
										collapseIcon={collapseIcon}
									/>
								)}
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
								/>
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
				</div>
			</div>
		</div>
	);
}

function processSSEEvent(
	eventType: string,
	data: any,
	assistantMsgId: string,
	currentText: string,
	toolCalls: Map<string, ToolCall>,
	setText: (t: string) => void,
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
	setSessionId: React.Dispatch<React.SetStateAction<string | null>>,
	showToolCalls: boolean,
) {
	switch (eventType) {
		case 'text': {
			const newText = currentText + (data.text ?? '');
			setText(newText);
			setMessages(prev =>
				prev.map(m =>
					m.id === assistantMsgId
						? { ...m, content: newText }
						: m,
				),
			);
			break;
		}
		case 'tool_start': {
			if (!showToolCalls) break;
			const tc: ToolCall = {
				id: data.tool_use_id ?? `tc_${Date.now()}`,
				toolName: data.tool_name ?? 'unknown',
				summary: '',
				isRunning: true,
			};
			toolCalls.set(tc.id, tc);
			setMessages(prev =>
				prev.map(m =>
					m.id === assistantMsgId
						? { ...m, toolCalls: Array.from(toolCalls.values()) }
						: m,
				),
			);
			break;
		}
		case 'tool_result': {
			if (!showToolCalls) break;
			const tcId = data.tool_use_id ?? '';
			const existing = toolCalls.get(tcId);
			if (existing) {
				existing.summary = data.summary ?? '';
				existing.success = data.success;
				existing.isRunning = false;
				setMessages(prev =>
					prev.map(m =>
						m.id === assistantMsgId
							? { ...m, toolCalls: Array.from(toolCalls.values()) }
							: m,
					),
				);
			}
			break;
		}
		case 'done': {
			if (data.session_id) {
				setSessionId(data.session_id);
			}
			break;
		}
		case 'error': {
			const errText = currentText + `\n\n*Error: ${data.message ?? 'Unknown error'}*`;
			setText(errText);
			setMessages(prev =>
				prev.map(m =>
					m.id === assistantMsgId ? { ...m, content: errText } : m,
				),
			);
			break;
		}
	}
}

const component: Component = {
	order: 100,
	name: 'Prompt',
	displayName: 'Prompt',
	description: 'AI chat prompt component',
	component: PromptComponent,
	styleComponent: PromptStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'prompt',
		type: 'Prompt',
		properties: {
			agentEndpoint: { value: '/api/ai/appbuilder/chat' },
			placeholder: { value: 'Ask anything' },
			welcomeMessage: { value: 'What can I help with?' },
			showSessions: { value: true },
			showToolCalls: { value: true },
			sessionsPerPage: { value: 20 },
			messagesPerPage: { value: 20 },
		},
	},
	stylePropertiesForTheme: stylePropertiesForTheme,
};

export default component;
