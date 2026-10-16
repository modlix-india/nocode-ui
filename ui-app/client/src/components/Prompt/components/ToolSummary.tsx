import React from 'react';
import { MarkdownParser } from '../../../commonComponents/Markdown/MarkdownParser';

// A tool's result, opened under its row. Tools answer in markdown (bold names,
// fenced JSON, lists), so it goes through the same parser as the assistant's
// replies instead of being shown as raw text.
export function ToolSummary({
	text,
	componentKey,
	styles,
}: Readonly<{ text: string; componentKey: string; styles: any }>) {
	return (
		<MarkdownParser
			componentKey={componentKey}
			text={text}
			styles={styles ?? {}}
			className="_toolSummaryMarkdown"
		/>
	);
}
