import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import React from 'react';
import ChadgerVaultAdvisory from './ChadgerVaultAdvisory';
import LockingVaultAdvisory from './LockingVaultAdivsory';
import RemunerationVaultAdvisory from './RemunerationVaultAdvisory';

interface Props {
	type: AdvisoryType;
	accept: () => void;
}

const VaultAdvisory = ({ type, accept }: Props): JSX.Element | null => {
	let advisory: JSX.Element | null;
	switch (type) {
		case AdvisoryType.ConvexLock:
			advisory = <LockingVaultAdvisory accept={accept} />;
			break;
		case AdvisoryType.Remuneration:
			advisory = <RemunerationVaultAdvisory accept={accept} />;
			break;
		case AdvisoryType.Chadger:
			advisory = <ChadgerVaultAdvisory accept={accept} />
			break;
		case AdvisoryType.None:
		default:
			advisory = null;
	}
	return advisory;
};

export default VaultAdvisory;
