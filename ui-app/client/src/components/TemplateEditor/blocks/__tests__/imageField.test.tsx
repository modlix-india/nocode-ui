/**
 * The image block's Upload button: a picture goes to the client's PUBLIC files and the block gets an absolute URL,
 * because a mail is read in a mail client that can neither sign in nor resolve a site-relative path.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import BlockPropertiesPanel, { absoluteImageUrl, TEMPLATE_IMAGES_PATH } from '../BlockPropertiesPanel';
import { uploadPastedFile } from '../../../MarkdownEditor/uploadPastedFile';

jest.mock('../../../MarkdownEditor/uploadPastedFile', () => ({
	uploadPastedFile: jest.fn(),
}));

describe('absoluteImageUrl', () => {
	it('puts the site in front of a site-relative URL', () => {
		expect(absoluteImageUrl('api/files/static/file/FIN/templateImages/a.png', 'https://x.modlix.com')).toBe(
			'https://x.modlix.com/api/files/static/file/FIN/templateImages/a.png',
		);
		expect(absoluteImageUrl('/api/files/static/file/FIN/a.png', 'https://x.modlix.com')).toBe(
			'https://x.modlix.com/api/files/static/file/FIN/a.png',
		);
	});
	it('leaves a full URL alone', () => {
		expect(absoluteImageUrl('https://cdn.example.com/a.png', 'https://x')).toBe('https://cdn.example.com/a.png');
	});
});

describe('image block upload', () => {
	it('uploads to the public template folder and writes the absolute URL', async () => {
		(uploadPastedFile as jest.Mock).mockResolvedValue('api/files/static/file/FIN/templateImages/a.png');
		const onChange = jest.fn();
		(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		await act(async () => {
			root.render(
				<BlockPropertiesPanel
					block={{ id: 'b1', type: 'image', props: { src: '' } } as any}
					variables={[]}
					onChange={onChange}
					onClose={() => {}}
				/>,
			);
		});
		expect(container.querySelector('._bpUpload')?.textContent).toBe('Upload');
		const file = new File(['x'], 'a.png', { type: 'image/png' });
		const input = container.querySelector('input[type=file]') as HTMLInputElement;
		Object.defineProperty(input, 'files', { value: [file] });
		await act(async () => {
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
		expect(onChange).toHaveBeenCalled();
		expect(uploadPastedFile).toHaveBeenCalledWith(file, 'STATIC', TEMPLATE_IMAGES_PATH);
		const props = onChange.mock.calls[0][0];
		expect(JSON.stringify(props)).toContain(`${globalThis.location.origin}/api/files/static/file/FIN/templateImages/a.png`);
		act(() => root.unmount());
	});
});
