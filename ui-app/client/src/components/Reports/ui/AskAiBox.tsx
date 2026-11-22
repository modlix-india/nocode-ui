import React, { useEffect, useRef, useState } from 'react';
import { AiEvent, AiGroup, AiPeriod, AiRequest, AiTurn, streamReportBuild } from '../reportAi';
import { ReportSpec } from '../reportTypes';
import { Icon } from './common';

/**
 * The "Ask AI" box of the report editor (CONTRACT 11): a prompt, the builder's status while it
 * works, its question as buttons, and each proposed spec handed to the editor (which shows it
 * in the shelves with the plain-words summary). Follow-ups carry the current spec and the
 * conversation so far ("make it a line by month").
 */

export interface AskAiBoxProps {
	endpoint: string;
	/** The spec in the editor now: sent with every prompt once there is one to refine. */
	currentSpec: () => ReportSpec | undefined;
	group?: string;
	groups?: Array<{ id: string; label: string; kind?: string }>;
	onSpec: (spec: ReportSpec, summary: string, group?: AiGroup, period?: AiPeriod) => void;
	/** For tests. */
	fetchImpl?: typeof fetch;
	/** Sent once when the box opens (a prompt typed on the list). */
	initialPrompt?: string;
}

export function AskAiBox(props: Readonly<AskAiBoxProps>) {
	const { endpoint, currentSpec, group, groups, onSpec, fetchImpl } = props;
	const [prompt, setPrompt] = useState('');
	const [running, setRunning] = useState(false);
	const [status, setStatus] = useState('');
	const [question, setQuestion] = useState<{ question: string; options: string[] }>();
	const [error, setError] = useState('');
	const [hasSpec, setHasSpec] = useState(false);
	const history = useRef<AiTurn[]>([]);
	const ctl = useRef<AbortController | undefined>(undefined);
	const onSpecRef = useRef(onSpec);
	onSpecRef.current = onSpec;

	useEffect(() => () => ctl.current?.abort(), []);
	const sentInitial = useRef(false);

	const ask = async (text: string) => {
		const t = text.trim();
		if (!t || running) return;
		ctl.current?.abort();
		const c = new AbortController();
		ctl.current = c;
		setRunning(true);
		setStatus('Thinking');
		setQuestion(undefined);
		setError('');
		setPrompt('');
		const body: AiRequest = {
			prompt: t,
			spec: currentSpec(),
			...(group ? { group } : {}),
			...(groups?.length ? { groups } : {}),
			...(history.current.length ? { history: history.current.slice(-10) } : {}),
		};
		history.current = [...history.current, { role: 'user', text: t }];
		const handle = (e: AiEvent) => {
			if (c.signal.aborted) return;
			if (e.type === 'status') setStatus(e.message);
			else if (e.type === 'question') {
				setQuestion({ question: e.question, options: e.options });
				history.current = [...history.current, { role: 'assistant', text: e.question }];
			} else if (e.type === 'spec') {
				history.current = [
					...history.current,
					{ role: 'assistant', text: e.summary || 'Here is the report.' },
				];
				setHasSpec(true);
				onSpecRef.current(e.spec, e.summary, e.group, e.period);
			} else if (e.type === 'error') setError(e.message);
			else if (e.type === 'done') {
				setRunning(false);
				setStatus('');
			}
		};
		await streamReportBuild(endpoint, body, handle, { signal: c.signal, fetchImpl });
	};

	useEffect(() => {
		if (sentInitial.current || !props.initialPrompt?.trim()) return;
		sentInitial.current = true;
		void ask(props.initialPrompt);
		// Once, on open.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stop = () => {
		ctl.current?.abort();
		setRunning(false);
		setStatus('');
	};

	return (
		<div className="_rpAsk" style={{ gridColumn: '1 / -1' }}>
			<form
				onSubmit={e => {
					e.preventDefault();
					void ask(prompt);
				}}
			>
				<textarea
					className="_rpInput"
					rows={1}
					aria-label="Ask AI for a report"
					placeholder={
						hasSpec
							? 'Change it, e.g. make it a line by month'
							: 'Ask AI, e.g. bookings by RM this quarter'
					}
					value={prompt}
					disabled={running}
					onChange={e => setPrompt(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							void ask(prompt);
						}
					}}
				/>
				{running ? (
					<button type="button" className="_rpBtn" onClick={stop}>
						<Icon name="fa-stop" /> Stop
					</button>
				) : (
					<button type="submit" className="_rpBtn _primary" disabled={!prompt.trim()}>
						<Icon name="fa-wand-magic-sparkles" /> Ask AI
					</button>
				)}
			</form>
			{running ? (
				<div className="_rpMuted" role="status" aria-live="polite">
					<Icon name="fa-spinner fa-spin" /> {status || 'Thinking'}
				</div>
			) : null}
			{question && !running ? (
				<div className="_rpGroup" role="group" aria-label="The AI asks">
					<span>{question.question}</span>
					<div className="_rpAskChoices">
						{question.options.map(o => (
							<button key={o} type="button" className="_rpBtn" onClick={() => ask(o)}>
								{o}
							</button>
						))}
					</div>
				</div>
			) : null}
			{error ? (
				<div className="_rpError" role="alert">
					{error}
				</div>
			) : null}
		</div>
	);
}
