import { useCallback } from 'react';

export function useDocumentMode() {
    const markdownToEditableContent = useCallback((markdown: string) => {
        let processedContent = markdown
            // Update the style regex to match new format
            .replace(/!!(.*?)!!\{style:"([^"]+)"\}/g, '<span style="$2">$1</span>')
            .replace(/\*\*\*(.*?)\*\*\*/g, '<span data-md-type="bold-italic">$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<span data-md-type="bold">$1</span>')
            .replace(/\*(.*?)\*/g, '<span data-md-type="italic">$1</span>')
            .replace(/~~(.*?)~~/g, '<span data-md-type="strikethrough">$1</span>')
            .replace(/`(.*?)`/g, '<span data-md-type="code">$1</span>')
            .replace(/==(.*?)==/g, '<span data-md-type="highlight">$1</span>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" data-md-type="link">$1</a>');

        processedContent = processedContent
            .replace(/^###### (.*$)/gm, '<h6 data-md-type="h6">$1</h6>')
            .replace(/^##### (.*$)/gm, '<h5 data-md-type="h5">$1</h5>')
            .replace(/^#### (.*$)/gm, '<h4 data-md-type="h4">$1</h4>')
            .replace(/^### (.*$)/gm, '<h3 data-md-type="h3">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 data-md-type="h2">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 data-md-type="h1">$1</h1>');

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
        let markdown = content
            // Update the conversion back to markdown
            .replace(/<span style="([^"]+)">(.*?)<\/span>/g, '!!$2!!{style:"$1"}')
            .replace(/\*\*\*(.*?)\*\*\*/g, '<span data-md-type="bold-italic">$1</span>')
            .replace(/\*\*(.*?)\*\*/g, '<span data-md-type="bold">$1</span>')
            .replace(/\*(.*?)\*/g, '<span data-md-type="italic">$1</span>')
            .replace(/~~(.*?)~~/g, '<span data-md-type="strikethrough">$1</span>')
            .replace(/`(.*?)`/g, '<span data-md-type="code">$1</span>')
            .replace(/==(.*?)==/g, '<span data-md-type="highlight">$1</span>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" data-md-type="link">$1</a>');

        return markdown;
    }, []);

    return { markdownToEditableContent, editableContentToMarkdown };
}
