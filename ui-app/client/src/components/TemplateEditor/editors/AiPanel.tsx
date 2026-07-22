import React, { useRef, useState } from 'react';

export interface AiMessage {
	role: 'user' | 'assistant';
	text: string;
}

interface AiPanelProps {
	history: AiMessage[];
	loading: boolean;
	error?: string;
	typeName: string;
	onSubmit: (prompt: string) => void;
}

// Prompt-driven authoring for the current template. Presentational: the parent runs the request and
// applies the result to the template (which updates the live preview on the right). Cmd/Ctrl+Enter
// submits.
export default function AiPanel({ history, loading, error, typeName, onSubmit }: Readonly<AiPanelProps>) {
	const [prompt, setPrompt] = useState('');
	const scrollRef = useRef<HTMLDivElement | null>(null);

	const submit = () => {
		const p = prompt.trim();
		if (!p || loading) return;
		onSubmit(p);
		setPrompt('');
	};

	return (
		<div className="_aiPanel">
			<p className="_panelHint">
				Describe the {typeName} you want, or ask for a change. The AI edits the template and
				the preview updates on the right; switch to Code to fine-tune.
			</p>

			<div className="_aiHistory" ref={scrollRef}>
				{history.length === 0 && !loading && (
					<div className="_aiExamples">
						<div className="_muted">Try:</div>
						<button
							type="button"
							className="_aiExample"
							onClick={() =>
								setPrompt(
									'A welcome email with a blue header, a greeting using ${name}, a short intro and a "Get started" button linking to ${actionUrl}.',
								)
							}
						>
							“A welcome email with a blue header, a greeting and a Get started button.”
						</button>
						<button
							type="button"
							className="_aiExample"
							onClick={() => setPrompt('Make the header darker and add a footer with an unsubscribe link.')}
						>
							“Make the header darker and add a footer with an unsubscribe link.”
						</button>
					</div>
				)}
				{history.map((m, i) => (
					<div key={i} className={`_aiMsg _${m.role}`}>
						{m.text}
					</div>
				))}
				{loading && <div className="_aiMsg _assistant _aiLoading">Generating…</div>}
			</div>

			{error && <div className="_panelError">{error}</div>}

			<div className="_aiComposer">
				<textarea
					className="_aiInput"
					value={prompt}
					placeholder="Describe or change the template…  (Cmd/Ctrl+Enter to send)"
					disabled={loading}
					onChange={e => setPrompt(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							submit();
						}
					}}
				/>
				<button
					type="button"
					className="_aiSend"
					onClick={submit}
					disabled={loading || !prompt.trim()}
				>
					<i className="fa fa-solid fa-wand-magic-sparkles" /> {loading ? 'Working…' : 'Generate'}
				</button>
			</div>
		</div>
	);
}
