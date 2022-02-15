import { Vault } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { VaultStrategy } from 'mobx/model/vaults/vault-strategy';
import { StrategyConfig } from '../model/strategies/strategy-config';
import { StrategyFee } from '../model/system-config/stategy-fees';

export function getStrategyFee(vault: Vault, fee: StrategyFee, config?: StrategyConfig): number {
	const defaultFee = config?.fees;
	const { strategy } = vault;
	let requestedFee: number | undefined;
	if (strategy) {
		requestedFee = getVaultStrategyFee(strategy, fee);
	}
	if (requestedFee === undefined) {
		switch (fee) {
			case StrategyFee.withdraw:
				requestedFee = defaultFee?.withdraw?.toNumber();
				break;
			case StrategyFee.performance:
				requestedFee = defaultFee?.performance?.toNumber();
				break;
			case StrategyFee.strategistPerformance:
				requestedFee = defaultFee?.strategistPerformance?.toNumber();
				break;
			case StrategyFee.yearnManagement:
				requestedFee = defaultFee?.yearnManagement?.toNumber();
				break;
			case StrategyFee.yearnPerformance:
				requestedFee = defaultFee?.yearnPerformance?.toNumber();
				break;
			case StrategyFee.harvestPerformance:
				requestedFee = defaultFee?.harvestPerformance?.toNumber();
				break;
			case StrategyFee.harvestStrategistPerformance:
				requestedFee = defaultFee?.harvestStrategistPerformance?.toNumber();
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

function getVaultStrategyFee(strategy: VaultStrategy, fee: StrategyFee): number | undefined {
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
