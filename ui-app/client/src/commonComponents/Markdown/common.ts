export interface MarkdownParserParameters {
	lineNumber: number;
	lines: string[];
	styles: any;
	onChange?: (text: string) => void;
	editable?: boolean;
	footNoteRefs: Map<string, MarkdownFootnoteRef>;
	urlRefs: Map<string, string>;
}

export interface MarkdownParserReturnValue {
	lineNumber: number;
	comp: JSX.Element | undefined;
}

export interface MarkdownFootnoteRef {
	ref: string;
	text: string;
	num: number;
	refKeys: string[];
}
