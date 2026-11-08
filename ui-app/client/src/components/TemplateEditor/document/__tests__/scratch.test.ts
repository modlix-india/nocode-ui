import * as fs from 'fs';
import { importDocument, compileDocument } from '../docModel';
it('count', () => {
	for (const n of ['cxBookingForm', 'cxEoiForm', 'cxAllotmentLetter', 'cxSaleAgreement', 'cxCostSheet', 'cxReceipt']) {
		const html = fs.readFileSync(`/Users/kirangrandhi/kiran/fincity/modlix-apps/cxzump_SYSTEM/templates/${n}.html`, 'utf8');
		const m = importDocument(html, 'pdf');
		fs.writeFileSync(`/Users/kirangrandhi/kiran/fincity/qa-pipeline/items/TEMPLATE-EDITOR/work/rt2_${n}.html`, compileDocument(m));
		console.log('BLOCKS', n, m.blocks.length, m.blocks.filter(b => b.type === 'html').length, m.blocks.map(b => b.type).join(','));
	}
});
