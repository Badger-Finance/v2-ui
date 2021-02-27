import { ClawStore, SponsorData, SyntheticData } from 'mobx/stores/clawStore';
import { invert as _invert, reduce, valuesIn as _valuesIn } from 'lodash';
import { names as TOKEN_NAMES } from 'config/system/tokens';
import deploy from 'config/deployments/mainnet.json';

export const EMPS_ADDRESSES = _valuesIn(deploy.claw_system.emps);

export function reduceEclaws(): Map<string, string> {
	const EMPS_BY_ADDRESS = _invert(deploy.claw_system.emps);
	return new Map(Object.entries(EMPS_BY_ADDRESS));
}

export function reduceCollaterals({ syntheticsData }: ClawStore): Map<string, string> {
	return syntheticsData.filter(filterAvailableTokenInformation).reduce(syntheticsToCollateral, new Map());
}

export function reduceCollateralEclawRelation({ syntheticsData }: ClawStore): Map<string, string> {
	return syntheticsData.reduce(collateralEclawRelation, new Map());
}

export function reduceSyntheticsData({ syntheticsData }: ClawStore): Map<string, SyntheticData> {
	return syntheticsData.reduce(keyByEmpAddress, new Map());
}

export function reduceSponsorData({ sponsorInformation }: ClawStore): Map<string, SponsorData> {
	return sponsorInformation.reduce(keyByEmpAddress, new Map());
}

// helper functions

function filterAvailableTokenInformation({ collateralCurrency }: SyntheticData) {
	return Object.keys(TOKEN_NAMES)
		.map((key) => key.toLocaleLowerCase())
		.includes(collateralCurrency.toLocaleLowerCase());
}

function syntheticsToCollateral(lastValue: Map<string, string>, { collateralCurrency }: SyntheticData) {
	return lastValue.set(collateralCurrency.toLocaleLowerCase(), TOKEN_NAMES[collateralCurrency.toLocaleLowerCase()]);
}

function keyByEmpAddress<T>(lastValue: Map<string, T>, incomingData: T, index: number) {
	return lastValue.set(EMPS_ADDRESSES[index], incomingData);
}

function collateralEclawRelation(lastValue: Map<string, string>, { collateralCurrency }: SyntheticData, index: number) {
	return lastValue.set(collateralCurrency.toLocaleLowerCase(), EMPS_ADDRESSES[index]);
}

function collateralEclaw(store: ClawStore) {
	const relation = new Map<string, string[]>();

	store.collaterals.forEach((_, key) => {
		const eclaws = store.syntheticsData
			.filter(({ collateralCurrency }) => collateralCurrency.toLocaleLowerCase() === key.toLocaleLowerCase())
			.map((_, index) => EMPS_ADDRESSES[index]);
		relation.set(key, eclaws);
	});

	return relation;
}
