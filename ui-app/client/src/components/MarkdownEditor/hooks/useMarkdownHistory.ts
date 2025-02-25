import { useState } from 'react';

export function useMarkdownHistory() {
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const addToHistory = (text: string) => {
		if (historyIndex === history.length - 1) {
			if (history.length === 0 || history[history.length - 1] !== text) {
				const newHistory = [...history, text];
				setHistory(newHistory);
				setHistoryIndex(newHistory.length - 1);
			}
		}
	};

	const undo = (setText: (text: string, callback?: () => void) => void, textAreaRef: any) => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setText(history[newIndex], () => {
				if (textAreaRef.current) {
					const pos = history[newIndex].length;
					textAreaRef.current.setSelectionRange(pos, pos);
				}
			});
		}
	};

	const redo = (setText: (text: string, callback?: () => void) => void, textAreaRef: any) => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setText(history[newIndex], () => {
				if (textAreaRef.current) {
					const pos = history[newIndex].length;
					textAreaRef.current.setSelectionRange(pos, pos);
				}
			});
		}
	};

	return { history, historyIndex, addToHistory, undo, redo };
}
