import BigNumber from 'bignumber.js';
import { invert as _invert, valuesIn as _valuesIn } from 'lodash';
import { ClawStore, SponsorData, SyntheticData } from 'mobx/stores/clawStore';
import { symbols as TOKEN_SYMBOLS } from 'config/system/tokens';
import deploy from 'config/deployments/mainnet.json';

export const EMPS_ADDRESSES = _valuesIn(deploy.claw_system.emps);

// [EMP_ADDRESS: string] => [EMP_NAME: string]
export function reduceEclaws(): Map<string, string> {
	const EMPS_BY_ADDRESS = _invert(deploy.claw_system.emps);
	return new Map(Object.entries(EMPS_BY_ADDRESS));
}

// [COLLATERAL_ADDRESS: string] => [COLLATERAL_NAME: string]
export function reduceCollaterals({ syntheticsData }: ClawStore): Map<string, string> {
	return syntheticsData.filter(hasTokenInformation).reduce(indexByCollateralAddress, new Map());
}

// [EMPS_ADDRESS: string] => [SYNTHETIC_DATA: SyntheticData]
export function reduceSyntheticsData({ syntheticsData }: ClawStore): Map<string, SyntheticData> {
	return syntheticsData.map(parseSyntheticHexToBigNumber).reduce(indexByEmpAddress, new Map());
}

// [EMPS_ADDRESS: string]  =>[SPONSOR_DATA: SponsorData]
export function reduceSponsorData({ sponsorInformation }: ClawStore): Map<string, SponsorData> {
	return sponsorInformation.map(parseSponsorsHexToBigNumber).reduce(indexByEmpAddress, new Map());
}

// [COLLATERAL_ADDRESS: string] => [ECLAW: [ECLAW_ADDRESS: string] => [ECLAW_NAME: string]]
export function reduceEclawByCollateral({ collaterals, syntheticsData }: ClawStore): Map<string, Map<string, string>> {
	return Array.from(collaterals).reduce(indexEclawsByCollateralAddress(syntheticsData), new Map());
}

// reducer's helper functions

function indexByCollateralAddress(collaterals: Map<string, string>, { collateralCurrency }: SyntheticData) {
	return collaterals.set(
		collateralCurrency.toLocaleLowerCase(),
		TOKEN_SYMBOLS[collateralCurrency.toLocaleLowerCase()],
	);
}

function indexByEmpAddress<T>(addresses: Map<string, T>, incomingData: T, index: number) {
	return addresses.set(EMPS_ADDRESSES[index], incomingData);
}

function indexByEclawAddress(eclaws: Map<string, string>, data: SyntheticData) {
	return eclaws.set(data.address, data.name);
}

function indexEclawsByCollateralAddress(emps: SyntheticData[]) {
	return (eclawsByCollateral: Map<string, Map<string, string>>, [collateral]: string[]) => {
		const eclaws = emps.filter(matchesCollateral(collateral)).reduce(indexByEclawAddress, new Map());
		return eclawsByCollateral.set(collateral, eclaws);
	};
}

function matchesCollateral(collateral: string) {
	return ({ collateralCurrency }: SyntheticData) =>
		collateralCurrency.toLocaleLowerCase() === collateral.toLocaleLowerCase();
}

function hasTokenInformation({ collateralCurrency }: SyntheticData) {
	return Object.keys(TOKEN_SYMBOLS)
		.map((key) => key.toLocaleLowerCase())
		.includes(collateralCurrency.toLocaleLowerCase());
}

// hex to big number parsers

function parseSponsorsHexToBigNumber({ liquidations, position, pendingWithdrawal }: SponsorData): SponsorData {
	return {
		pendingWithdrawal,
		liquidations: liquidations.map(parseLiquidationHexToBigNumber),
		position: parsePositionHexToBigNumber(position),
	};
}

function parseSyntheticHexToBigNumber(data: SyntheticData): SyntheticData {
	const {
		globalCollateralizationRatio,
		totalPositionCollateral,
		totalTokensOutstanding,
		expirationTimestamp,
		cumulativeFeeMultiplier,
		minSponsorTokens,
		withdrawalLiveness,
		liquidationLiveness,
		...skipParse
	} = data;

	return {
		...skipParse,
		globalCollateralizationRatio: new BigNumber((globalCollateralizationRatio as any).hex),
		totalPositionCollateral: new BigNumber((totalPositionCollateral as any).hex),
		totalTokensOutstanding: new BigNumber((totalTokensOutstanding as any).hex),
		expirationTimestamp: new BigNumber((expirationTimestamp as any).hex),
		cumulativeFeeMultiplier: new BigNumber((cumulativeFeeMultiplier as any).hex),
		minSponsorTokens: new BigNumber((minSponsorTokens as any).hex),
		withdrawalLiveness: new BigNumber((withdrawalLiveness as any).hex),
		liquidationLiveness: new BigNumber((liquidationLiveness as any).hex),
	};
}

function parseLiquidationHexToBigNumber(data: SponsorData['liquidations'][0]): SponsorData['liquidations'][0] {
	const {
		state,
		liquidatedCollateral,
		tokensOutstanding,
		lockedCollateral,
		liquidationTime,
		rawUnitCollateral,
		settlementPrice,
		finalFee,
		...skipParse
	} = data;

	return {
		...skipParse,
		state: new BigNumber((state as any).hex),
		liquidatedCollateral: new BigNumber((liquidatedCollateral as any).hex),
		tokensOutstanding: new BigNumber((tokensOutstanding as any).hex),
		lockedCollateral: new BigNumber((lockedCollateral as any).hex),
		liquidationTime: new BigNumber((liquidationTime as any).hex),
		rawUnitCollateral: new BigNumber((rawUnitCollateral as any).hex),
		settlementPrice: new BigNumber((settlementPrice as any).hex),
		finalFee: new BigNumber((finalFee as any).hex),
	};
}

function parsePositionHexToBigNumber(data: SponsorData['position']): SponsorData['position'] {
	const {
		tokensOutstanding,
		withdrawalRequestPassTimestamp,
		withdrawalRequestAmount,
		rawCollateral,
		transferPositionRequestPassTimestamp,
	} = data;

	return {
		tokensOutstanding: new BigNumber((tokensOutstanding as any).hex),
		withdrawalRequestPassTimestamp: new BigNumber((withdrawalRequestPassTimestamp as any).hex),
		withdrawalRequestAmount: new BigNumber((withdrawalRequestAmount as any).hex),
		rawCollateral: new BigNumber((rawCollateral as any).hex),
		transferPositionRequestPassTimestamp: new BigNumber((transferPositionRequestPassTimestamp as any).hex),
	};
}
