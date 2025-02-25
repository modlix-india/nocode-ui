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
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
		.replace(/\*(.*)\*/gim, '<em>$1</em>')
		.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
		.replace(/\n$/gim, '<br />');

	return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${filename}</title>
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
	const printWindow = window.open('', '_blank');
	if (!printWindow) return;

	const markdownContent = document.querySelector('._markdown')?.innerHTML || '';
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
            ${markdownContent}
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
}
