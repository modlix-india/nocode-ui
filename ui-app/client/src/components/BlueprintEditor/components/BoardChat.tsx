import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getDataFromPath } from '../../../context/StoreContext';
import { FileBrowser } from '../../../commonComponents/FileBrowser';
import { MarkdownParser } from '../../../commonComponents/Markdown/MarkdownParser';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

/**
 * The board's own prompt bar.
 *
 * This is deliberately NOT the `Prompt` component. Prompt is a chat: a
 * transcript you read, with sessions, steering, attachments, tool call cards and
 * a model picker. The board needs something different in kind — the BOARD is the
 * reply. You ask for a change and the cards change; the only prose worth keeping
 * on screen is the last thing said, because everything else the agent did is
 * already visible as the plan.
 *
 * Standing the two side by side on a page was worse than a style mismatch. It
 * made the selection a store round trip, and it made "put this on the site" need
 * a new capability on a shared component used by six other surfaces, so that a
 * board could push a sentence into a chat that happened to be next to it. One
 * component owning both halves means the selection is just state.
 *
 * Loaded through React.lazy from the board, so the streaming code and this
 * markup are a separate chunk: the board is the thing people wait for, and it
 * must not wait for a fetch reader it may never use.
 */

export interface ChatContextChip {
	uid: string;
	title: string;
	/** The column a card belongs to, so "Hero on Home" is nameable. */
	parent?: string;
}

interface BoardChatProps {
	definition: ComponentDefinition;
	/** The app being planned. Sent as `app_code`, so the agent works on it. */
	appCode: string;
	/** `/api/ai/appbuilder/chat` unless an app points somewhere else. */
	agentEndpoint: string;
	placeholder: string;
	/** What kind of screen this is, told to the agent so it reads the rest. */
	contextSurface?: string;
	/**
	 * The gate is the same bar with a different job: it has nothing to select,
	 * it leads with a primary verb rather than an arrow, and it starts a plan
	 * instead of changing one.
	 */
	variant: 'gate' | 'board';
	submitLabel?: string;
	submitIcon?: string;
	attachIcon?: string;
	/** The line beside the paperclip. Shown on both screens, so they match. */
	attachHint?: string;
	sendIcon?: string;
	/** Selected cards and columns, rendered as removable chips. */
	chips: ChatContextChip[];
	onRemoveChip?: (uid: string) => void;
	onClearChips?: () => void;
	/**
	 * The agent saved something. The board re-reads rather than guessing what
	 * changed: a turn can touch several objects and a diff we invented here
	 * would be a second, worse copy of what a re-read already answers.
	 */
	onObjectChanged?: (name: string) => void;
	/** The turn ended. The host refreshes whatever it owns. */
	onTurnEnd?: () => void;
	/** Streaming state, so the board can disable what must not be touched. */
	onStreamingChange?: (streaming: boolean) => void;
	/**
	 * Hand the typed text to the host instead of streaming it to the agent.
	 *
	 * The gate needs this and the board does not, and the difference is not
	 * cosmetic. On the gate there is no plan yet, so "Make a plan" has to
	 * GENERATE one — a single schema-shaped model call with no tools. Sending
	 * that sentence to the build agent instead would have it start creating
	 * pages for a site nobody has agreed the shape of, which is the one thing
	 * the whole plan-before-build idea exists to prevent.
	 */
	onSubmitText?: (text: string) => void;
}

/** What the file input will offer, matching the Prompt's own list. */
const ATTACH_ACCEPT = 'image/*,.pdf,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx';

async function fileToBase64(file: File): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? '');
			// A data: url is "data:<mime>;base64,<payload>" and the server wants
			// the payload alone.
			resolve(result.slice(result.indexOf(',') + 1));
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/**
 * Something the person put in the box alongside their words.
 *
 * Two origins, and they travel differently. A file picked off this machine has
 * to be carried, so it goes as base64 on the request the way the Prompt sends
 * one. A file already in the app's own storage has a url the agent can fetch
 * with the tools it already has, so it goes as a url and not as bytes: sending
 * a 4MB image the server already holds, back to the server, is a slow way to
 * say a path.
 */
export interface ChatAttachment {
	id: string;
	name: string;
	mimeType: string;
	/** Set for a local pick. */
	file?: File;
	/** Set for something chosen out of the app's files. */
	url?: string;
}

/** The last exchange, which is all that stays on screen. */
interface Exchange {
	you: string;
	reply: string;
}

const MAX_INPUT_HEIGHT = 160;

export default function BoardChat({
	definition,
	appCode,
	agentEndpoint,
	placeholder,
	contextSurface,
	variant,
	submitLabel,
	submitIcon = 'ms material-symbols-outlined mso-auto_awesome',
	attachIcon = 'ms material-symbols-outlined mso-attach_file',
	attachHint = 'A logo, photos, or a site you like',
	sendIcon = 'ms material-symbols-outlined mso-arrow_upward',
	chips,
	onRemoveChip,
	onClearChips,
	onObjectChanged,
	onTurnEnd,
	onStreamingChange,
	onSubmitText,
}: Readonly<BoardChatProps>) {
	const [draft, setDraft] = useState('');
	const [streaming, setStreaming] = useState(false);
	const [exchange, setExchange] = useState<Exchange | null>(null);
	const [doing, setDoing] = useState('');
	const [failed, setFailed] = useState('');

	const sessionRef = useRef<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const inputRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => onStreamingChange?.(streaming), [streaming, onStreamingChange]);

	// Let go of the reader on unmount, or the turn keeps writing into state that
	// has gone.
	useEffect(() => () => abortRef.current?.abort(), []);

	const grow = useCallback(() => {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
	}, []);

	// What the paperclip put in the box, and which of its two doors is open.
	const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
	const [attachMenu, setAttachMenu] = useState(false);
	const [browsing, setBrowsing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const addFiles = useCallback((files: FileList | null) => {
		if (!files?.length) return;
		setAttachments(current => [
			...current,
			...Array.from(files).map(file => ({
				id: `f_${file.name}_${file.size}_${file.lastModified}`,
				name: file.name,
				mimeType: file.type,
				file,
			})),
		]);
	}, []);

	const headers = useCallback((): Record<string, string> => {
		// Read straight from the store rather than taken as props: these are
		// ambient identity, and a component that accepted them would let a page
		// author send the wrong ones. `Store.auth.accessToken` first and
		// `LocalStore.AuthToken` second, because reading a `token` key that does
		// not exist on Store.auth is what once sent an empty Authorization on
		// every AI call and only worked while the cookie happened to be there.
		const token =
			getDataFromPath('Store.auth.accessToken', []) ??
			getDataFromPath('LocalStore.AuthToken', []) ??
			'';
		return {
			'Content-Type': 'application/json',
			Authorization: token ? `Bearer ${token}` : '',
			clientCode: (getDataFromPath('Store.auth.loggedInClientCode', []) ?? '') as string,
			appCode: (getDataFromPath('Store.application.appCode', []) ?? '') as string,
		};
	}, []);

	/**
	 * Read the agent's stream, keeping only what this surface shows.
	 *
	 * `text` builds the one reply line. `tool_start` becomes a single "what it is
	 * doing" line that replaces itself, because a list of forty tool calls is the
	 * transcript this component exists to avoid. `object_changed` tells the board
	 * to re-read, which is how the answer actually arrives.
	 */
	const consume = useCallback(
		async (response: Response, question: string) => {
			const reader = response.body?.getReader();
			if (!reader) throw new Error('The agent sent no body to read.');

			const decoder = new TextDecoder();
			let buffer = '';
			let reply = '';
			let eventType = '';

			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				// One SSE event can be split across reads, so only whole
				// "\n\n"-terminated records are parsed and the tail is kept.
				const records = buffer.split('\n\n');
				buffer = records.pop() ?? '';

				for (const record of records) {
					for (const line of record.split('\n')) {
						if (line.startsWith('event: ')) {
							eventType = line.slice(7).trim();
							continue;
						}
						if (!line.startsWith('data: ') || !eventType) continue;

						let data: any;
						try {
							data = JSON.parse(line.slice(6));
						} catch {
							continue; // a partial line; the next read completes it
						}

						switch (eventType) {
							case 'text':
								reply += data.text ?? '';
								setExchange({ you: question, reply });
								setDoing('');
								break;
							case 'tool_start':
								setDoing(data.display_name || data.tool_name || 'working');
								break;
							case 'object_changed':
								if (data.name) onObjectChanged?.(data.name);
								break;
							case 'error':
								setFailed(
									data.message ||
										data.error ||
										'The agent stopped with an error.',
								);
								break;
							case 'done':
							case 'complete':
								if (data.session_id) sessionRef.current = data.session_id;
								break;
							default:
								break;
						}
					}
				}
			}
		},
		[onObjectChanged],
	);

	const send = useCallback(async () => {
		const text = draft.trim();
		if (!text || streaming) return;

		// The gate hands the sentence back rather than streaming it: there is no
		// plan yet, so it has to be generated, not built.
		if (onSubmitText) {
			setDraft('');
			setFailed('');
			setExchange({ you: text, reply: '' });
			setDoing('writing the plan');
			onSubmitText(text);
			return;
		}

		setDraft('');
		setFailed('');
		setDoing('thinking');
		setExchange({ you: text, reply: '' });
		setStreaming(true);
		if (inputRef.current) inputRef.current.style.height = 'auto';

		abortRef.current = new AbortController();
		// Local files are carried as base64; a file already in the app's storage
		// is named by its url, because the agent can fetch that itself and the
		// bytes are already on the server that would be receiving them.
		const carried = await Promise.all(
			attachments.map(async a => ({
				type: a.mimeType.startsWith('image/') ? 'image' : 'file',
				name: a.name,
				mime_type: a.mimeType,
				...(a.file ? { data: await fileToBase64(a.file) } : {}),
				...(a.url ? { url: a.url } : {}),
			})),
		);
		setAttachments([]);
		try {
			const response = await fetch(agentEndpoint, {
				method: 'POST',
				headers: headers(),
				signal: abortRef.current.signal,
				body: JSON.stringify({
					message: chips.length ? `${text}\n\n${describeChips(chips)}` : text,
					...(carried.length ? { attachments: carried } : {}),
					session_id: sessionRef.current,
					...(appCode ? { app_code: appCode } : {}),
					...(contextSurface ? { editor_context: { surface: contextSurface } } : {}),
					// Always sent. The server defaults an absent value to DRAFT, so
					// omitting it would quietly draft the edits of a surface that
					// asked to write live.
					draft_mode: 'LIVE',
				}),
			});

			if (!response.ok) {
				setFailed(
					response.status === 409
						? 'That conversation is already working on something. Give it a moment.'
						: `The agent answered ${response.status}.`,
				);
				return;
			}
			await consume(response, text);
		} catch (err: any) {
			if (err?.name !== 'AbortError') setFailed(err?.message || 'Could not reach the agent.');
		} finally {
			setStreaming(false);
			setDoing('');
			abortRef.current = null;
			onTurnEnd?.();
		}
	}, [
		draft,
		streaming,
		agentEndpoint,
		headers,
		chips,
		appCode,
		contextSurface,
		consume,
		onTurnEnd,
		onSubmitText,
		attachments,
	]);

	const stop = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setStreaming(false);
		setDoing('');
	}, []);

	const isGate = variant === 'gate';

	return (
		<div className={`_promptFoot${isGate ? ' _gate' : ''}`}>
			<SubHelperComponent definition={definition} subComponentName="promptFoot" />
			<div className="_promptInner">
				{/* The same three blocks, in the order each screen needs.
				    On the gate they read down the page: what was said, what it is
				    about, and the box at the foot. In the pane the box is at the
				    TOP with the answer under it, so the thing you type into stays
				    where you left it and a long reply grows downwards instead of
				    shoving it off the bottom of the screen. */}
				{isGate ? (
					<>
						{exchange ? (
							<>
								<div className="_exchangeLine">
									<SubHelperComponent
										definition={definition}
										subComponentName="exchangeLine"
									/>
									<b>You</b>
									<span>{exchange.you}</span>
								</div>
								{exchange.reply || doing ? (
									<div className="_exchangeLine _reply">
										<span className="_exchangeDash">—</span>
										{/* The agent answers in markdown, and it was being
									    printed as source: literal ** around what should
									    have been bold, and numbered lists running into
									    one paragraph. This is the platform's own parser,
									    the one the Prompt's transcript uses, so a reply
									    here and a reply there are rendered by the same
									    code. */}
										<span className="_replyBody">
											<MarkdownParser
												componentKey={`${definition.key}_reply`}
												text={exchange.reply}
												styles={{}}
											/>
											{doing ? <em className="_doing">{doing}…</em> : null}
										</span>
									</div>
								) : null}
							</>
						) : null}

						{failed ? (
							<div className="_exchangeLine _failed">
								<span className="_exchangeDash">—</span>
								<span>{failed}</span>
							</div>
						) : null}
						{chips.length ? (
							<div className="_contextRow">
								<SubHelperComponent
									definition={definition}
									subComponentName="contextRow"
								/>
								<span className="_contextLabel">About</span>
								{chips.map(c => (
									<span className="_contextChip" key={c.uid}>
										<SubHelperComponent
											definition={definition}
											subComponentName="contextChip"
										/>
										<span className="_contextChipText">{c.title}</span>
										{c.parent ? (
											<span className="_contextChipParent">{c.parent}</span>
										) : null}
										<button
											type="button"
											className="_contextChipClose"
											aria-label={`Stop talking about ${c.title}`}
											onClick={() => onRemoveChip?.(c.uid)}
										>
											×
										</button>
									</span>
								))}
								<button
									type="button"
									className="_contextClear"
									onClick={() => onClearChips?.()}
								>
									clear
								</button>
							</div>
						) : null}
						{attachments.length ? (
							<div className="_attachRow">
								{attachments.map(a => (
									<span className="_attachChip" key={a.id}>
										<span className="_attachChipText">{a.name}</span>
										<button
											type="button"
											className="_attachChipClose"
											aria-label={`Remove ${a.name}`}
											onClick={() =>
												setAttachments(cur =>
													cur.filter(x => x.id !== a.id),
												)
											}
										>
											×
										</button>
									</span>
								))}
							</div>
						) : null}

						<div className="_askBox">
							<SubHelperComponent definition={definition} subComponentName="askBox" />
							<textarea
								ref={inputRef}
								className="_askInput"
								rows={3}
								value={draft}
								placeholder={placeholder}
								disabled={streaming}
								onChange={e => {
									setDraft(e.target.value);
									grow();
								}}
								onKeyDown={e => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										send();
									}
								}}
							/>
							<div className="_askRow">
								<SubHelperComponent
									definition={definition}
									subComponentName="askRow"
								/>
								{/* Two doors, because there are two different things people
							    mean by "attach": a file off this machine, and one the
							    app already holds. The second is the platform's own file
							    browser rather than a second implementation of it. */}
								<div className="_askAttachWrap">
									<button
										type="button"
										className="_askAttach"
										aria-label="Attach a file"
										aria-expanded={attachMenu}
										onClick={() => setAttachMenu(open => !open)}
									>
										<i className={attachIcon} />
									</button>
									{attachMenu ? (
										<div className="_askAttachMenu">
											<SubHelperComponent
												definition={definition}
												subComponentName="askAttachMenu"
											/>
											<button
												type="button"
												onClick={() => {
													setAttachMenu(false);
													fileInputRef.current?.click();
												}}
											>
												Upload from this device
											</button>
											<button
												type="button"
												onClick={() => {
													setAttachMenu(false);
													setBrowsing(true);
												}}
											>
												Choose from assets
											</button>
										</div>
									) : null}
								</div>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									accept={ATTACH_ACCEPT}
									style={{ display: 'none' }}
									onChange={e => {
										addFiles(e.target.files);
										// Cleared so picking the same file twice in a row
										// still fires a change.
										e.target.value = '';
									}}
								/>
								<span className="_askHint">{attachHint}</span>
								<span className="_askSpacer" />
								{streaming ? (
									<button type="button" className="_askStop" onClick={stop}>
										Stop
									</button>
								) : (
									<button
										type="button"
										className="_askSend _primary"
										disabled={!draft.trim()}
										onClick={send}
										aria-label={submitLabel ?? 'Send'}
									>
										<SubHelperComponent
											definition={definition}
											subComponentName="askSend"
										/>
										<i className={isGate ? submitIcon : sendIcon} />
										{submitLabel ?? 'Send'}
									</button>
								)}
							</div>
						</div>
					</>
				) : (
					<>
						{attachments.length ? (
							<div className="_attachRow">
								{attachments.map(a => (
									<span className="_attachChip" key={a.id}>
										<span className="_attachChipText">{a.name}</span>
										<button
											type="button"
											className="_attachChipClose"
											aria-label={`Remove ${a.name}`}
											onClick={() =>
												setAttachments(cur =>
													cur.filter(x => x.id !== a.id),
												)
											}
										>
											×
										</button>
									</span>
								))}
							</div>
						) : null}

						<div className="_askBox">
							<SubHelperComponent definition={definition} subComponentName="askBox" />
							<textarea
								ref={inputRef}
								className="_askInput"
								rows={3}
								value={draft}
								placeholder={placeholder}
								disabled={streaming}
								onChange={e => {
									setDraft(e.target.value);
									grow();
								}}
								onKeyDown={e => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										send();
									}
								}}
							/>
							<div className="_askRow">
								<SubHelperComponent
									definition={definition}
									subComponentName="askRow"
								/>
								{/* Two doors, because there are two different things people
							    mean by "attach": a file off this machine, and one the
							    app already holds. The second is the platform's own file
							    browser rather than a second implementation of it. */}
								<div className="_askAttachWrap">
									<button
										type="button"
										className="_askAttach"
										aria-label="Attach a file"
										aria-expanded={attachMenu}
										onClick={() => setAttachMenu(open => !open)}
									>
										<i className={attachIcon} />
									</button>
									{attachMenu ? (
										<div className="_askAttachMenu">
											<SubHelperComponent
												definition={definition}
												subComponentName="askAttachMenu"
											/>
											<button
												type="button"
												onClick={() => {
													setAttachMenu(false);
													fileInputRef.current?.click();
												}}
											>
												Upload from this device
											</button>
											<button
												type="button"
												onClick={() => {
													setAttachMenu(false);
													setBrowsing(true);
												}}
											>
												Choose from assets
											</button>
										</div>
									) : null}
								</div>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									accept={ATTACH_ACCEPT}
									style={{ display: 'none' }}
									onChange={e => {
										addFiles(e.target.files);
										// Cleared so picking the same file twice in a row
										// still fires a change.
										e.target.value = '';
									}}
								/>
								<span className="_askHint">{attachHint}</span>
								<span className="_askSpacer" />
								{streaming ? (
									<button type="button" className="_askStop" onClick={stop}>
										Stop
									</button>
								) : (
									<button
										type="button"
										className="_askSend _primary"
										disabled={!draft.trim()}
										onClick={send}
										aria-label={submitLabel ?? 'Send'}
									>
										<SubHelperComponent
											definition={definition}
											subComponentName="askSend"
										/>
										<i className={isGate ? submitIcon : sendIcon} />
										{submitLabel ?? 'Send'}
									</button>
								)}
							</div>
						</div>
						{chips.length ? (
							<div className="_contextRow">
								<SubHelperComponent
									definition={definition}
									subComponentName="contextRow"
								/>
								<span className="_contextLabel">About</span>
								{chips.map(c => (
									<span className="_contextChip" key={c.uid}>
										<SubHelperComponent
											definition={definition}
											subComponentName="contextChip"
										/>
										<span className="_contextChipText">{c.title}</span>
										{c.parent ? (
											<span className="_contextChipParent">{c.parent}</span>
										) : null}
										<button
											type="button"
											className="_contextChipClose"
											aria-label={`Stop talking about ${c.title}`}
											onClick={() => onRemoveChip?.(c.uid)}
										>
											×
										</button>
									</span>
								))}
								<button
									type="button"
									className="_contextClear"
									onClick={() => onClearChips?.()}
								>
									clear
								</button>
							</div>
						) : null}
						{exchange ? (
							<>
								<div className="_exchangeLine">
									<SubHelperComponent
										definition={definition}
										subComponentName="exchangeLine"
									/>
									<b>You</b>
									<span>{exchange.you}</span>
								</div>
								{exchange.reply || doing ? (
									<div className="_exchangeLine _reply">
										<span className="_exchangeDash">—</span>
										{/* The agent answers in markdown, and it was being
									    printed as source: literal ** around what should
									    have been bold, and numbered lists running into
									    one paragraph. This is the platform's own parser,
									    the one the Prompt's transcript uses, so a reply
									    here and a reply there are rendered by the same
									    code. */}
										<span className="_replyBody">
											<MarkdownParser
												componentKey={`${definition.key}_reply`}
												text={exchange.reply}
												styles={{}}
											/>
											{doing ? <em className="_doing">{doing}…</em> : null}
										</span>
									</div>
								) : null}
							</>
						) : null}

						{failed ? (
							<div className="_exchangeLine _failed">
								<span className="_exchangeDash">—</span>
								<span>{failed}</span>
							</div>
						) : null}
					</>
				)}
			</div>
			{browsing ? (
				<div className="_browserBackdrop" onClick={() => setBrowsing(false)}>
					<div className="_browserPanel" onClick={e => e.stopPropagation()}>
						<FileBrowser
							editOnUpload={false}
							allowMultipleSelection={false}
							selectedFile={''}
							onChange={(url: string) => {
								const name = String(url).split('/').filter(Boolean).pop() ?? url;
								setAttachments(cur => [
									...cur,
									{ id: `a_${url}`, name, mimeType: '', url: String(url) },
								]);
								setBrowsing(false);
							}}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}

/**
 * Name the selection to the agent in words rather than uids.
 *
 * The chips say "Hero on Home"; a uid says nothing to a model and nothing to a
 * person reading the transcript later.
 */
function describeChips(chips: ChatContextChip[]): string {
	const named = chips.map(c => (c.parent ? `"${c.title}" on ${c.parent}` : `"${c.title}"`));
	return `[I have selected ${named.join(', ')} on the plan. That is what I am asking about.]`;
}
