import { ClawStore, SponsorData, SyntheticData } from 'mobx/stores/clawStore';
import { invert as _invert, valuesIn as _valuesIn } from 'lodash';
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
	return syntheticsData.reduce(indexByEmpAddress, new Map());
}

// [EMPS_ADDRESS: string]  =>[SPONSOR_DATA: SponsorData]
export function reduceSponsorData({ sponsorInformation }: ClawStore): Map<string, SponsorData> {
	return sponsorInformation.reduce(indexByEmpAddress, new Map());
}

// [COLLATERAL_ADDRESS: string] => [ECLAW: [ECLAW_ADDRESS: string] => [ECLAW_NAME: string]]
export function reduceEclawByCollateral({ collaterals, syntheticsData }: ClawStore): Map<string, Map<string, string>> {
	return Array.from(collaterals).reduce(indexEmpByCollateralAddress(syntheticsData), new Map());
}

// helper functions

function indexByCollateralAddress(lastValue: Map<string, string>, { collateralCurrency }: SyntheticData) {
	return lastValue.set(collateralCurrency.toLocaleLowerCase(), TOKEN_SYMBOLS[collateralCurrency.toLocaleLowerCase()]);
}

function indexByEmpAddress<T>(lastValue: Map<string, T>, incomingData: T, index: number) {
	return lastValue.set(EMPS_ADDRESSES[index], incomingData);
}

function indexByEclawAddress(lastValue: Map<string, string>, data: SyntheticData) {
	return lastValue.set(data.address, data.name);
}

function indexEmpByCollateralAddress(data: SyntheticData[]) {
	return (lastValue: Map<string, Map<string, string>>, [collateral]: string[]) => {
		const eclaws = data.filter(matchesCollateral(collateral)).reduce(indexByEclawAddress, new Map());
		return lastValue.set(collateral, eclaws);
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
