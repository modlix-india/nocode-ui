import {
	convertEachStringToShadow,
	splitShadows,
} from '../../../../../../src/components/PageEditor/editors/stylePropertyValueEditors/simpleEditors/ShadowEditor';

describe('ShadowEditor', () => {
	test('Shadows Split', () => {
		expect(splitShadows('0px 0px 0px 0px #000000')).toEqual(['0px 0px 0px 0px #000000']);
		expect(splitShadows('0px 0px 0px 0px #100000, 0px 0px 0px 0px #000000')).toEqual([
			'0px 0px 0px 0px #100000',
			'0px 0px 0px 0px #000000',
		]);
		expect(
			splitShadows('0px 0px 0px 0px rgba(2,3, 4, 0.5) inset, 0px 0px 0px 0px #000000'),
		).toEqual(['0px 0px 0px 0px rgba(2,3, 4, 0.5) inset', '0px 0px 0px 0px #000000']);

		expect(splitShadows('0px 0px 0px 0px rgba(2,3, 4, 0.5)')).toEqual([
			'0px 0px 0px 0px rgba(2,3, 4, 0.5)',
		]);

		expect(convertEachStringToShadow(splitShadows('0px 0px rgba(2,3, 4, 0.5)')[0])).toEqual({
			hOffset: '0px',
			vOffset: '0px',
			color: 'rgba(2,3, 4, 0.5)',
		});
	});
});
