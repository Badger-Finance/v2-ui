import React from 'react';
import { checkSnapshot } from './utils/snapshots';
import { SettAvailableDeposit } from '../components-v2/common/dialogs/SettAvailableDeposit';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import { MAX } from '../config/constants';

describe('SettAvailableDeposit', () => {
	it('displays deposit limits', () => {
		const mockCap = new TokenBalance(
			{ address: '0x798D1bE841a82a273720CE31c822C61a67a601C3', decimals: 9, symbol: 'DIGG' },
			new BigNumber('512014272658'),
			new BigNumber('15.720585159535592'),
		);

		checkSnapshot(
			<SettAvailableDeposit
				vaultCapInfo={{
					vaultCap: mockCap,
					totalVaultCap: mockCap,
					userCap: mockCap,
					totalUserCap: mockCap,
					asset: 'DIGG',
				}}
			/>,
		);
	});

	it('does not show user limits if limit is max cap', () => {
		const normalCap = new TokenBalance(
			{ address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24', decimals: 18 },
			new BigNumber('341319340751832806348'),
			new BigNumber('1.52499515342814'),
		);

		const maxCap = new TokenBalance(
			{ address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24', decimals: 18 },
			new BigNumber(MAX),
			new BigNumber('1.52499515342814'),
		);

		checkSnapshot(
			<SettAvailableDeposit
				vaultCapInfo={{
					vaultCap: normalCap,
					totalVaultCap: normalCap,
					userCap: maxCap,
					totalUserCap: maxCap,
					asset: 'imBTC',
				}}
			/>,
		);
	});

	it('does not show vault limits if limit is max cap', () => {
		const normalCap = new TokenBalance(
			{ address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24', decimals: 18 },
			new BigNumber('341319340751832806348'),
			new BigNumber('1.52499515342814'),
		);

		const maxCap = new TokenBalance(
			{ address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24', decimals: 18 },
			new BigNumber(MAX),
			new BigNumber('1.52499515342814'),
		);

		checkSnapshot(
			<SettAvailableDeposit
				vaultCapInfo={{
					vaultCap: maxCap,
					totalVaultCap: maxCap,
					userCap: normalCap,
					totalUserCap: normalCap,
					asset: 'imBTC',
				}}
			/>,
		);
	});

	it('does not show any limits if both user and vault limits are max cap', () => {
		const maxCap = new TokenBalance(
			{ address: '0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24', decimals: 18 },
			new BigNumber(MAX),
			new BigNumber('1.52499515342814'),
		);

		checkSnapshot(
			<SettAvailableDeposit
				vaultCapInfo={{
					vaultCap: maxCap,
					totalVaultCap: maxCap,
					userCap: maxCap,
					totalUserCap: maxCap,
					asset: 'imBTC',
				}}
			/>,
		);
	});
});
