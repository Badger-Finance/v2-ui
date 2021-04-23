import '@testing-library/jest-dom';
import { checkShopEligibility, fetchBouncerProof, getAccountDetails } from '../mobx/utils/apiV2';
import { mockApi } from './utils/apiV2';

jest.setTimeout(60000);
mockApi();

it('', async () => {
	// console.log('listSetts =>', JSON.stringify(await listSetts(), null, 4));
	// console.log('listGeysers =>', JSON.stringify(await listGeysers(), null, 4));
	// console.log('getTokenPrices =>', JSON.stringify(await getTokenPrices(), null, 4));
	// console.log('getTotalValueLocked =>', JSON.stringify(await getTotalValueLocked(), null, 4));
	console.log(
		'checkShopEligibility =>',
		JSON.stringify(await checkShopEligibility('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'), null, 4),
	);
	console.log(
		'fetchBouncerProof =>',
		JSON.stringify(await fetchBouncerProof('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'), null, 4),
	);
	console.log(
		'getAccountDetails =>',
		JSON.stringify(await getAccountDetails('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'), null, 4),
	);
});
