import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SceneDocument } from '../../../util/three/sceneDocument';
import {
	SCENE_AI_ENDPOINT,
	attachmentFor,
	describeError,
	readReply,
	sceneAiHeaders,
	serialiseAttachments,
	type SceneAttachment,
} from './sceneAi';

interface Turn {
	role: 'user' | 'assistant';
	text: string;
	warnings?: string[];
	attachments?: string[];
}

interface ScenePromptPaneProps {
	doc: SceneDocument;
	componentType: string;
	/** Applies a returned document. Goes through the modal's undo stack. */
	onApply: (doc: SceneDocument) => void;
}

/**
 * Describing a scene instead of building it field by field.
 *
 * The panels next door are the right instrument for nudging one object and the
 * wrong one for "make this look like a sunrise": a scene document is fifty-odd
 * nested fields plus GLSL, and the fastest route to most of them is a sentence.
 *
 * Nothing here saves. A result lands on the modal's undo stack exactly like a
 * hand edit, so it is one Undo away and reaches the page only if the user
 * presses Save — which is what makes it safe to let a model rewrite the whole
 * document in one go.
 */
export function ScenePromptPane({ doc, componentType, onApply }: Readonly<ScenePromptPaneProps>) {
	const [text, setText] = useState('');
	const [turns, setTurns] = useState<Turn[]>([]);
	const [busy, setBusy] = useState(false);
	const [attachments, setAttachments] = useState<SceneAttachment[]>([]);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const logRef = useRef<HTMLDivElement | null>(null);

	// Object URLs outlive the component unless they are revoked, and this pane
	// is mounted and unmounted every time the user switches tabs.
	const liveUrls = useRef<string[]>([]);
	liveUrls.current = attachments.map(a => a.url);
	useEffect(
		() => () => {
			for (const url of liveUrls.current) URL.revokeObjectURL(url);
		},
		[],
	);

	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
	}, [turns, busy]);

	const addFiles = useCallback((files: FileList | File[] | null) => {
		if (!files) return;
		const next = Array.from(files).map(attachmentFor);
		if (next.length) setAttachments(prev => [...prev, ...next]);
	}, []);

	const removeAttachment = useCallback((id: string) => {
		setAttachments(prev => {
			const gone = prev.find(a => a.id === id);
			if (gone) URL.revokeObjectURL(gone.url);
			return prev.filter(a => a.id !== id);
		});
	}, []);

	const onPaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			const files: File[] = [];
			for (let i = 0; i < items.length; i++) {
				if (!items[i].type.startsWith('image/')) continue;
				const f = items[i].getAsFile();
				if (f) files.push(f);
			}
			if (!files.length) return;
			// Only prevented once an image was actually found, so pasting text
			// into the box still behaves like pasting text.
			e.preventDefault();
			addFiles(files);
		},
		[addFiles],
	);

	const send = useCallback(async () => {
		const prompt = text.trim();
		if (!prompt || busy) return;
		setBusy(true);
		setText('');
		const sent = attachments;
		setAttachments([]);
		setTurns(t => [...t, { role: 'user', text: prompt, attachments: sent.map(a => a.name) }]);

		try {
			const body = {
				prompt,
				scene: doc,
				componentType,
				attachments: await serialiseAttachments(sent),
			};
			const res = await axios.post(SCENE_AI_ENDPOINT, body, {
				headers: sceneAiHeaders(),
			});
			const result = readReply(res.data);
			if (result.doc) onApply(result.doc);
			setTurns(t => [
				...t,
				{
					role: 'assistant',
					text: result.doc ? result.message : result.message || 'Nothing was changed.',
					warnings: result.warnings,
				},
			]);
		} catch (e) {
			setTurns(t => [...t, { role: 'assistant', text: describeError(e) }]);
		} finally {
			// The object URLs belonged to the attachments that have just been
			// sent and cleared, so nothing on screen points at them any more.
			for (const a of sent) URL.revokeObjectURL(a.url);
			setBusy(false);
		}
	}, [text, busy, attachments, doc, componentType, onApply]);

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	};

	return (
		<div className="_scenePromptPane">
			<div className="_scenePromptLog" ref={logRef}>
				{turns.length === 0 ? (
					<p className="_sceneNote">
						Describe what you want and the scene is rewritten to match. Paste a
						screenshot or attach a file to work from a reference.
						<br />
						<br />
						Nothing here saves: every result lands on the undo stack, so Undo takes it
						back and only Save reaches the page.
					</p>
				) : null}
				{turns.map((turn, i) => (
					<div
						// Turns are only ever appended, so the index is stable
						// for the life of the entry.
						key={`${turn.role}_${i}`}
						className={`_scenePromptTurn _${turn.role}`}
					>
						<div className="_scenePromptText">{turn.text}</div>
						{turn.attachments?.length ? (
							<div className="_scenePromptAttached">
								{turn.attachments.join(', ')}
							</div>
						) : null}
						{turn.warnings?.length ? (
							<ul className="_scenePromptWarnings">
								{turn.warnings.map(w => (
									<li key={w}>{w}</li>
								))}
							</ul>
						) : null}
					</div>
				))}
				{busy ? <div className="_scenePromptTurn _assistant">Working…</div> : null}
			</div>

			{attachments.length ? (
				<div className="_scenePromptAttachments">
					{attachments.map(a => (
						<div key={a.id} className="_scenePromptChip">
							{a.isImage ? (
								<img src={a.url} alt={a.name} />
							) : (
								<span className="_scenePromptFile">{a.name}</span>
							)}
							<button
								type="button"
								title={`Remove ${a.name}`}
								onClick={() => removeAttachment(a.id)}
							>
								×
							</button>
						</div>
					))}
				</div>
			) : null}

			<div className="_scenePromptBar">
				<button
					type="button"
					className="_sceneToolBtn"
					title="Attach an image or a file"
					disabled={busy}
					onClick={() => fileRef.current?.click()}
				>
					+
				</button>
				<input
					ref={fileRef}
					type="file"
					multiple
					accept="image/*,.json,.txt,.glsl,.frag,.vert,.glb,.gltf,.hdr"
					style={{ display: 'none' }}
					onChange={e => {
						addFiles(e.target.files);
						e.target.value = '';
					}}
				/>
				<textarea
					className="_scenePromptInput"
					value={text}
					rows={2}
					placeholder="A deep blue aurora, slower, with a warm crest…"
					disabled={busy}
					onChange={e => setText(e.target.value)}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
				/>
				<button
					type="button"
					className="_sceneSaveButton"
					disabled={busy || !text.trim()}
					onClick={send}
				>
					Send
				</button>
			</div>
		</div>
	);
}
