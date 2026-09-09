import React, { useCallback, useEffect, useRef, useState } from 'react';
import { formatCombo, specFromEvent } from '../../../../shortcuts/comboUtil';
import { checkReserved } from '../../../../shortcuts/reservedCombos';

interface ShortcutKeyEditorProps {
	value?: string;
	onChange: (v: string | undefined) => void;
	placeholder?: string;
}

/**
 * Record-a-key editor for the `shortcutKey` property.
 *
 * Free-text combos are the single largest source of silently dead shortcuts, so the
 * default mode captures the real key press and writes a portable spec (`Mod` for the
 * platform's primary modifier). Reserved-key feedback appears inline: red for combos
 * the browser never delivers, amber for ones that hijack a known browser function.
 */
export function ShortcutKeyEditor({
	value,
	onChange,
	placeholder = 'Click and press the keys',
}: Readonly<ShortcutKeyEditorProps>) {
	const [recording, setRecording] = useState(false);
	const [typing, setTyping] = useState(false);
	const [draft, setDraft] = useState(value ?? '');
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => setDraft(value ?? ''), [value]);

	const stopRecording = useCallback(() => setRecording(false), []);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLButtonElement>) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				stopRecording();
				buttonRef.current?.blur();
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			const spec = specFromEvent(e.nativeEvent);
			if (!spec) return;

			onChange(spec);
			stopRecording();
		},
		[onChange, stopRecording],
	);

	const reserved = checkReserved(value);
	const display = formatCombo(value);

	const feedback = (() => {
		if (!reserved) return undefined;
		const blocked = reserved.level === 'BLOCKED';
		const className = blocked ? '_shortcutKeyBlocked' : '_shortcutKeyRisky';
		const prefix = blocked ? 'This will never fire.' : 'This works, but note:';
		return (
			<div className={`_shortcutKeyFeedback ${className}`}>{`${prefix} ${reserved.reason}`}</div>
		);
	})();

	if (typing) {
		return (
			<div className="_shortcutKeyEditor">
				<div className="_shortcutKeyRow">
					<input
						className="_peInput"
						value={draft}
						placeholder="e.g. Mod+Shift+K"
						onChange={e => setDraft(e.target.value)}
						onBlur={() => onChange(draft.trim() || undefined)}
						onKeyUp={e => {
							if (e.key === 'Enter') onChange(draft.trim() || undefined);
						}}
					/>
					<button
						type="button"
						className="_shortcutKeyModeToggle"
						title="Record the keys instead"
						onClick={() => setTyping(false)}
					>
						<i className="fa fa-solid fa-keyboard" />
					</button>
				</div>
				{feedback}
			</div>
		);
	}

	return (
		<div className="_shortcutKeyEditor">
			<div className="_shortcutKeyRow">
				<button
					ref={buttonRef}
					type="button"
					className={`_shortcutKeyCapture ${recording ? '_recording' : ''} ${
						reserved?.level === 'BLOCKED' ? '_blocked' : ''
					}`}
					onClick={() => setRecording(true)}
					onFocus={() => setRecording(true)}
					onBlur={stopRecording}
					onKeyDown={onKeyDown}
				>
					{recording ? 'Press the keys...' : (display ?? placeholder)}
				</button>
				{value ? (
					<button
						type="button"
						className="_shortcutKeyClear"
						title="Clear the shortcut"
						onClick={() => onChange(undefined)}
					>
						<i className="fa fa-solid fa-xmark" />
					</button>
				) : undefined}
				<button
					type="button"
					className="_shortcutKeyModeToggle"
					title="Type the shortcut instead"
					onClick={() => setTyping(true)}
				>
					<i className="fa fa-solid fa-pen" />
				</button>
			</div>
			{feedback}
		</div>
	);
}

export default ShortcutKeyEditor;
