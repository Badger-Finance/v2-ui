// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
import fetchMock from 'jest-fetch-mock';
import '@testing-library/jest-dom';
import crypto from 'crypto';
import LockedCvxDelegationStore from './mobx/stores/lockedCvxDelegationStore';
import { setupMockAPI } from './tests/utils/setup';

Object.defineProperty(global, 'crypto', {
	value: { getRandomValues: (arr) => crypto.randomBytes(arr.length) },
});

// the @computed annotation from mobx causes troubles with jest, it makes getters always return their initial value even if they are
// update. Since we don't really need it in test suites we can mock it
jest.mock('mobx', () => ({ ...jest.requireActual('mobx'), computed: jest.fn() }));

jest.spyOn(LockedCvxDelegationStore.prototype, 'loadLockedCvxBalance').mockImplementation();
jest.spyOn(LockedCvxDelegationStore.prototype, 'loadVotiumRewardsInformation').mockImplementation();
jest.spyOn(LockedCvxDelegationStore.prototype, 'getUserDelegationState').mockImplementation();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

fetchMock.enableMocks();
setupMockAPI();

export default function () {
	return null;
}
