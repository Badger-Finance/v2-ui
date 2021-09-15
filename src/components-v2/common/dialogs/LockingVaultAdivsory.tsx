import React from 'react';
import GenericVaultAdvisory from './GenericVaulAdvisory';

interface Props {
	accept: () => void;
}

const LockingVaultAdvisory = ({ accept }: Props): JSX.Element => {
	return (
		<GenericVaultAdvisory accept={accept}>
			<p>This vault locks Convex in a staking contract that is 16 weeks long.</p>
			<p>
				The Total Withdrawable Amount in the vault may be lower than your balance depending on what is currently
				available and will fluctuate with deposits and withdraws from the vault as well as locks and unlocks
				from the contract.
			</p>
		</GenericVaultAdvisory>
	);
};

export default LockingVaultAdvisory;
