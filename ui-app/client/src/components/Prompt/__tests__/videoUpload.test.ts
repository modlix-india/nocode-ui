/**
 * Video attachments (ADZ-1326): off unless the page names an upload folder, MP4 and MOV only,
 * refused before upload past the size limit, uploaded to the folder with a unique name.
 */

import axios from 'axios';
import {
	VIDEO_ACCEPT,
	attachAccept,
	sizeWords,
	uniqueVideoName,
	uploadVideo,
	videoMimeType,
	videoTooLargeMessage,
	videoUploadUrl,
} from '../videoUpload';

jest.mock('axios');
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => 'Bearer test-token',
}));

const MB = 1024 * 1024;

describe('attachAccept', () => {
	it('keeps the usual list when videos are off', () => {
		expect(attachAccept(false)).toBe('image/*,.pdf,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx');
		expect(attachAccept(false)).not.toContain('video');
	});

	it('adds MP4 and MOV when videos are on', () => {
		expect(attachAccept(true)).toContain(VIDEO_ACCEPT);
		expect(attachAccept(true).startsWith('image/*,.pdf')).toBe(true);
	});
});

describe('videoMimeType', () => {
	it('knows MP4 and MOV by type or by extension', () => {
		expect(videoMimeType({ name: 'tour.mp4', type: 'video/mp4' })).toBe('video/mp4');
		expect(videoMimeType({ name: 'clip.MOV', type: '' })).toBe('video/quicktime');
		expect(videoMimeType({ name: 'a.m4v', type: '' })).toBe('video/mp4');
	});

	it('is undefined for anything else', () => {
		expect(videoMimeType({ name: 'feed.jpg', type: 'image/jpeg' })).toBeUndefined();
		expect(videoMimeType({ name: 'clip.webm', type: 'video/webm' })).toBeUndefined();
		expect(videoMimeType({ name: 'mp4', type: '' })).toBeUndefined();
	});
});

describe('videoTooLargeMessage', () => {
	it('lets a video within the limit through', () => {
		expect(videoTooLargeMessage({ name: 'a.mp4', size: 1024 * MB }, 1024)).toBeUndefined();
	});

	it('names the size and the limit past it', () => {
		expect(videoTooLargeMessage({ name: 'big.mp4', size: 1536 * MB }, 1024)).toBe(
			'big.mp4 is 1.5 GB. Videos can be up to 1 GB; export a shorter or smaller file.',
		);
	});

	it('has no limit at 0', () => {
		expect(videoTooLargeMessage({ name: 'a.mp4', size: 5000 * MB }, 0)).toBeUndefined();
	});
});

describe('names and urls', () => {
	it('words sizes', () => {
		expect(sizeWords(350 * MB)).toBe('350 MB');
		expect(sizeWords(2 * 1024 * MB)).toBe('2 GB');
	});

	it('makes the folder url', () => {
		expect(videoUploadUrl('secured/_withInClient/adzumptwo/creative-uploads/')).toBe(
			'/api/files/secured/_withInClient/adzumptwo/creative-uploads',
		);
		expect(videoUploadUrl('/api/files/static/videos')).toBe('/api/files/static/videos');
	});

	it('keeps the name readable and unique', () => {
		const one = uniqueVideoName('My Tour (final).mp4');
		expect(one).toMatch(/^chat_[^_]+_my-tour-final$/);
		expect(uniqueVideoName('My Tour (final).mp4')).not.toBe(one);
	});
});

describe('uploadVideo', () => {
	it('posts the file with a unique name and answers its root-relative path', async () => {
		(axios.post as jest.Mock).mockResolvedValue({
			data: {
				url: 'api/files/secured/file/FIN/_withInClient/adzumptwo/creative-uploads/x.mp4',
			},
		});
		const seen: number[] = [];
		const file = new File(['abc'], 'tour.mp4', { type: 'video/mp4' });
		const url = await uploadVideo(file, 'secured/_withInClient/adzumptwo/creative-uploads', p =>
			seen.push(p),
		);
		expect(url).toBe(
			'/api/files/secured/file/FIN/_withInClient/adzumptwo/creative-uploads/x.mp4',
		);
		const [endpoint, form, config] = (axios.post as jest.Mock).mock.calls[0];
		expect(endpoint).toBe('/api/files/secured/_withInClient/adzumptwo/creative-uploads');
		expect((form as FormData).get('file')).toBeInstanceOf(File);
		expect(String((form as FormData).get('name'))).toMatch(/^chat_.+_tour$/);
		expect(config.headers.Authorization).toBe('Bearer test-token');
		config.onUploadProgress({ loaded: 50, total: 100 });
		expect(seen).toEqual([50]);
	});

	it('fails when the service answers no file', async () => {
		(axios.post as jest.Mock).mockResolvedValue({ data: {} });
		await expect(uploadVideo(new File(['a'], 'a.mp4'), 'secured/x')).rejects.toThrow(
			'The upload returned no file.',
		);
	});
});
