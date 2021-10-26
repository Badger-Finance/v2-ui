// See https://github.com/facebook/jest/issues/9983
import { TextEncoder, TextDecoder } from 'util';
import fetchMock from 'jest-fetch-mock';
import crypto from 'crypto';
import LockedCvxDelegationStore from './mobx/stores/lockedCvxDelegationStore';

Object.defineProperty(global, 'crypto', {
	value: { getRandomValues: (arr) => crypto.randomBytes(arr.length) },
});

jest.spyOn(LockedCvxDelegationStore.prototype, 'loadLockedCvxBalance').mockImplementation();
jest.spyOn(LockedCvxDelegationStore.prototype, 'loadVotiumRewardsInformation').mockImplementation();
jest.spyOn(LockedCvxDelegationStore.prototype, 'getUserDelegationState').mockImplementation();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

fetchMock.enableMocks();

export default function () {
	return null;
}
