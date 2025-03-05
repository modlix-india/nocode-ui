import { useCallback } from 'react';

export function useDocumentMode() {
	const markdownToEditableContent = useCallback((markdown: string) => {
		// First process combined formats to avoid conflicts
		let processedContent = markdown
			.replace(/\*\*\*(.*?)\*\*\*/g, '<span data-md-type="bold-italic">$1</span>')
			.replace(/\*\*(.*?)\*\*/g, '<span data-md-type="bold">$1</span>')
			.replace(/\*(.*?)\*/g, '<span data-md-type="italic">$1</span>')
			.replace(/~~(.*?)~~/g, '<span data-md-type="strikethrough">$1</span>')
			.replace(/`(.*?)`/g, '<span data-md-type="code">$1</span>')
			.replace(/==(.*?)==/g, '<span data-md-type="highlight">$1</span>')
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" data-md-type="link">$1</a>');

		// Then process headers
		processedContent = processedContent
			.replace(/^###### (.*$)/gm, '<h6 data-md-type="h6">$1</h6>')
			.replace(/^##### (.*$)/gm, '<h5 data-md-type="h5">$1</h5>')
			.replace(/^#### (.*$)/gm, '<h4 data-md-type="h4">$1</h4>')
			.replace(/^### (.*$)/gm, '<h3 data-md-type="h3">$1</h3>')
			.replace(/^## (.*$)/gm, '<h2 data-md-type="h2">$1</h2>')
			.replace(/^# (.*$)/gm, '<h1 data-md-type="h1">$1</h1>');

		// Add alignment processing
		processedContent = processedContent
			.replace(/^:::\s*left\s*\n([\s\S]*?)\n:::/gm, '<div data-md-type="align-left">$1</div>')
			.replace(
				/^:::\s*center\s*\n([\s\S]*?)\n:::/gm,
				'<div data-md-type="align-center">$1</div>',
			)
			.replace(
				/^:::\s*right\s*\n([\s\S]*?)\n:::/gm,
				'<div data-md-type="align-right">$1</div>',
			)
			.replace(
				/^:::\s*justify\s*\n([\s\S]*?)\n:::/gm,
				'<div data-md-type="align-justify">$1</div>',
			)
			.replace(/^(\s{4,})(.*?)$/gm, '<div data-md-type="indent">$2</div>');

		return processedContent;
	}, []);

	const editableContentToMarkdown = useCallback((content: string) => {
		// First normalize any HTML formatting to our data attributes
		let processedContent = content
			.replace(/<b>(.*?)<\/b>/g, '<span data-md-type="bold">$1</span>')
			.replace(/<strong>(.*?)<\/strong>/g, '<span data-md-type="bold">$1</span>')
			.replace(/<i>(.*?)<\/i>/g, '<span data-md-type="italic">$1</span>')
			.replace(/<em>(.*?)<\/em>/g, '<span data-md-type="italic">$1</span>')
			.replace(/<code>(.*?)<\/code>/g, '<span data-md-type="code">$1</span>');

		// Convert back to markdown, handling nested formats first
		return processedContent
			.replace(/<span data-md-type="bold-italic">(.*?)<\/span>/g, '***$1***')
			.replace(
				/<span data-md-type="bold"><span data-md-type="italic">(.*?)<\/span><\/span>/g,
				'***$1***',
			)
			.replace(
				/<span data-md-type="italic"><span data-md-type="bold">(.*?)<\/span><\/span>/g,
				'***$1***',
			)
			.replace(/<h6 data-md-type="h6">(.*?)<\/h6>/g, '###### $1')
			.replace(/<h5 data-md-type="h5">(.*?)<\/h5>/g, '##### $1')
			.replace(/<h4 data-md-type="h4">(.*?)<\/h4>/g, '#### $1')
			.replace(/<h3 data-md-type="h3">(.*?)<\/h3>/g, '### $1')
			.replace(/<h2 data-md-type="h2">(.*?)<\/h2>/g, '## $1')
			.replace(/<h1 data-md-type="h1">(.*?)<\/h1>/g, '# $1')
			.replace(/<span data-md-type="bold">(.*?)<\/span>/g, '**$1**')
			.replace(/<span data-md-type="italic">(.*?)<\/span>/g, '*$1*')
			.replace(/<span data-md-type="strikethrough">(.*?)<\/span>/g, '~~$1~~')
			.replace(/<span data-md-type="code">(.*?)<\/span>/g, '`$1`')
			.replace(/<span data-md-type="highlight">(.*?)<\/span>/g, '==$1==')
			.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
			.replace(/<[^>]+>/g, '');

		// Add alignment conversion
		return processedContent
			.replace(
				/<div[^>]*data-md-type="align-left"[^>]*>([\s\S]*?)<\/div>/g,
				'::: left\n$1\n:::',
			)
			.replace(
				/<div[^>]*data-md-type="align-center"[^>]*>([\s\S]*?)<\/div>/g,
				'::: center\n$1\n:::',
			)
			.replace(
				/<div[^>]*data-md-type="align-right"[^>]*>([\s\S]*?)<\/div>/g,
				'::: right\n$1\n:::',
			)
			.replace(
				/<div[^>]*data-md-type="align-justify"[^>]*>([\s\S]*?)<\/div>/g,
				'::: justify\n$1\n:::',
			)
			.replace(/<div[^>]*data-md-type="indent"[^>]*>([\s\S]*?)<\/div>/g, '    $1')
			.replace(/<[^>]+>/g, '');
	}, []);

	return {
		markdownToEditableContent,
		editableContentToMarkdown,
	};
}
