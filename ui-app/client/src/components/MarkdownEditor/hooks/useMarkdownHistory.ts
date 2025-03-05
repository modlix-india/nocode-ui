import { useState } from 'react';

export function useMarkdownHistory() {
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [lastCommand, setLastCommand] = useState<string>('');

	const addToHistory = (text: string, command?: string) => {
		if (historyIndex === history.length - 1) {
			if (
				history.length === 0 ||
				(history[history.length - 1] !== text && !(command && command === lastCommand))
			) {
				const newHistory = [...history, text];
				setHistory(newHistory);
				setHistoryIndex(newHistory.length - 1);
				if (command) setLastCommand(command);
			}
		}
	};

	const undo = (setText: (text: string, callback?: () => void) => void, textAreaRef: any) => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setText(history[newIndex], () => {
				if (textAreaRef.current) {
					const currentSelection = textAreaRef.current.selectionStart;
					textAreaRef.current.setSelectionRange(currentSelection, currentSelection);
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
					const currentSelection = textAreaRef.current.selectionStart;
					textAreaRef.current.setSelectionRange(currentSelection, currentSelection);
				}
			});
		}
	};

	return {
		history,
		historyIndex,
		addToHistory,
		undo,
		redo,
	};
}
