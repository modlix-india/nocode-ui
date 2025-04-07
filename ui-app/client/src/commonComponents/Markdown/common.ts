export interface MarkdownParserParameters {
	componentKey: string;
	lineNumber: number;
	lines: string[];
	styles: any;
	onChange?: (text: string) => void;
	editable?: boolean;
	footNotes?: MarkdowFootnotes;
	urlRefs?: Map<string, MarkdownURLRef>;
	line?: string;
	indentationLength?: number;
}

export interface MarkdownParserReturnValue {
	lineNumber: number;
	comp: Array<MDDef>;
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

export interface MDDef {
	type: string;
	start: number;
	end: number;
	text: string;
	marker: string;
	attributes?: Record<string, string>;
	children?: Array<MDDef>;
	lineNumber: number;
	toLineNumber?: number;
}