import { Vault } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { FeeConfig } from 'mobx/model/fees/fee-config';
import { VaultStrategy } from 'mobx/model/vaults/vault-strategy';
import { StrategyFee } from '../model/system-config/stategy-fees';

export function getStrategyFee(vault: Vault, fee: StrategyFee, defaultFeeConfig?: FeeConfig): number {
	const { strategy } = vault;
	let requestedFee: number | undefined;
	if (strategy) {
		requestedFee = getVaultStrategyFee(strategy, fee);
	}
	if (requestedFee === undefined) {
		switch (fee) {
			case StrategyFee.withdraw:
				requestedFee = defaultFeeConfig?.withdraw?.toNumber();
				break;
			case StrategyFee.performance:
				requestedFee = defaultFeeConfig?.performance?.toNumber();
				break;
			case StrategyFee.strategistPerformance:
				requestedFee = defaultFeeConfig?.strategistPerformance?.toNumber();
				break;
			case StrategyFee.yearnManagement:
				requestedFee = defaultFeeConfig?.yearnManagement?.toNumber();
				break;
			case StrategyFee.yearnPerformance:
				requestedFee = defaultFeeConfig?.yearnPerformance?.toNumber();
				break;
			case StrategyFee.harvestPerformance:
				requestedFee = defaultFeeConfig?.harvestPerformance?.toNumber();
				break;
			case StrategyFee.harvestStrategistPerformance:
				requestedFee = defaultFeeConfig?.harvestStrategistPerformance?.toNumber();
				break;
			default:
				break;
		}
	}
	if (requestedFee === undefined) {
		throw new Error(`${vault.name} missing default ${fee} fee`);
	}
	return requestedFee;
}

export function getVaultStrategyFee(strategy: VaultStrategy, fee: StrategyFee): number | undefined {
	if (strategy.address === ethers.constants.AddressZero) {
		return;
	}
	switch (fee) {
		case StrategyFee.withdraw:
			return strategy.withdrawFee;
		case StrategyFee.performance:
			return strategy.performanceFee;
		case StrategyFee.strategistPerformance:
			return strategy.strategistFee;
		default:
			return;
	}
}
