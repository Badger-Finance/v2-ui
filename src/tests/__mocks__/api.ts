import * as api from '../../mobx/utils/apiV2';

jest.spyOn(api, 'checkShopEligibility').mockReturnValue(
	Promise.resolve({
		isEligible: true,
	}),
);

jest.spyOn(api, 'fetchBouncerProof').mockReturnValue(
	Promise.resolve({
		address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1b',
		proof: [],
	}),
);

jest.spyOn(api, 'getAccountDetails').mockReturnValue(
	Promise.resolve({
		id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1b',
		value: 0,
		earnedValue: 0,
		balances: [],
		depositLimits: {
			'0x4b92d19c11435614CD49Af1b589001b7c08cD4D9': {
				available: 0.5,
				limit: 0.5,
			},
		},
	}),
);
