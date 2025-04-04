export function useMarkdownExport() {
	const handleExport = (text: string, type: 'md' | 'html' | 'pdf') => {
		let content = '';
		let filename = `document_${new Date().getTime()}`;
		let mimeType = '';

		switch (type) {
			case 'md':
				content = text;
				filename += '.md';
				mimeType = 'text/markdown';
				break;
			case 'html':
				content = convertToHTML(text, filename);
				filename += '.html';
				mimeType = 'text/html';
				break;

			case 'pdf':
				exportToPDF(text, filename);
				return;
		}

		downloadFile(content, filename, mimeType);
	};

	return { handleExport };
}

function convertToHTML(text: string, filename: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text
    .replace(/\{style="([^"]+)"\}(.*?)\{style\}/g, (_, styles, content) => {
      const styleAttr = styles
        .split(',')
        .map((style: string) => {
          const [prop, value] = style.split(':').map(s => s.trim());
          const cssProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
          return `${cssProp}: ${value}`;
        })
        .join('; ');
      return `<span style="${styleAttr}">${content}</span>`;
    })
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^1\. (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/~~(.*)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/==(.*)==/gim, '<mark>$1</mark>')
    .replace(/^:::\s*left\s*\n([\s\S]*?)\n:::/gim, '<div style="text-align: left">$1</div>')
    .replace(/^:::\s*center\s*\n([\s\S]*?)\n:::/gim, '<div style="text-align: center">$1</div>')
    .replace(/^:::\s*right\s*\n([\s\S]*?)\n:::/gim, '<div style="text-align: right">$1</div>')
    .replace(
      /^:::\s*justify\s*\n([\s\S]*?)\n:::/gim,
      '<div style="text-align: justify">$1</div>',
    )
    .replace(/^:::\s*rtl\s*\n([\s\S]*?)\n:::/gim, '<div style="direction: rtl">$1</div>')
    .replace(/^:::\s*ltr\s*\n([\s\S]*?)\n:::/gim, '<div style="direction: ltr">$1</div>')
    .replace(
      /!\[(.*?)\]\((.*?)\)/gim,
      '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">',
    )
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^(\s{4,})(.*?)$/gim, '<div style="padding-left: 2em">$2</div>')
    .replace(/<li>.*?<\/li>\n?/gim, match => `<ul>${match}</ul>`)
    // Line breaks
    .replace(/\n$/gim, '<br />');

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${filename}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 1em auto;
                }
                code {
                    background: #f5f5f5;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                }
                blockquote {
                    border-left: 4px solid #ddd;
                    margin: 1em 0;
                    padding: 0.5em 1em;
                    background: #f9f9f9;
                }
                mark {
                    background-color: #fff1a7;
                    padding: 0.2em;
                }
                ul, ol {
                    padding-left: 2em;
                }
            </style>
        </head>
        <body>
            ${tempDiv.innerHTML}
        </body>
        </html>
    `;
}

function downloadFile(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

function exportToPDF(text: string, filename: string) {
	const htmlContent = convertToHTML(text, filename);

	const printWindow = window.open('', '_blank');
	if (!printWindow) return;

	printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                }
                pre { 
                    white-space: pre-wrap;
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                }
                code {
                    background: #f5f5f5;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 15px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f5f5f5;
                }
                blockquote {
                    border-left: 4px solid #ddd;
                    margin: 15px 0;
                    padding: 10px 20px;
                    background: #f9f9f9;
                }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `);

	printWindow.document.close(); // Important: close the document

	// Wait for resources to load then print
	printWindow.onload = () => {
		printWindow.print();
		// Close the window after print dialog is closed
		setTimeout(() => {
			printWindow.close();
		}, 1000);
	};
}
