export interface MarkdownParserParameters {
	componentKey: string;
	lineNumber: number;
	lines: string[];
	styles: any;
	onChange?: (text: string) => void;
	editable?: boolean;
	footNotes: MarkdowFootnotes;
	urlRefs: Map<string, MarkdownURLRef>;
	line?: string;
	indentationLength?: number;
}

export interface MarkdownParserReturnValue {
	lineNumber: number;
	comp: JSX.Element[] | JSX.Element | undefined;
}

export interface MarkdowFootnotes {
	currentRefNumber: number;
	footNoteRefs: Map<string, MarkdownFootnoteRef>;
}

export interface MarkdownFootnoteRef {
	ref: string;
	text: string;
	num: number;
	refNum?: number;
}

export interface MarkdownURLRef {
	title?: string;
	url: string;
}
