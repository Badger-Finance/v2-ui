import React from 'react';
import { VaultDTO } from '@badger-dao/sdk';
import AdvisoryLink from './AdvisoryLink';
import GenericVaultAdvisory, { VaultAdvisoryBaseProps } from './GenericVaulAdvisory';
import { Link } from '@material-ui/core';

interface LockingVaultAdvisoryProps extends VaultAdvisoryBaseProps {
	vault: VaultDTO;
	lockingWeeks: number;
	learnMoreLink?: string;
}

// NOTE: this is a temporary advisory, it will be removed once the bootstrapping disclosure is done
const AuraLockingVaultAdvisory = ({
	vault,
	accept,
	lockingWeeks,
	learnMoreLink,
}: LockingVaultAdvisoryProps): JSX.Element => {
	return (
		<GenericVaultAdvisory accept={accept}>
			<p>
				This vault is currently undergoing a{' '}
				<Link target="_blank" rel="noreferrer" href="https://badger.com/gravity-news/graviaura-bootstrapping">
					bootstrapping event
				</Link>
				. Yields are currently higher than they will be in the future.
			</p>
			<p>{`This vault locks ${vault.asset} in a staking contract that is ${lockingWeeks} weeks long.`}</p>
			<p>
				The Total Withdrawable Amount in the vault may be lower than your balance depending on what is currently
				available and will fluctuate with deposits and withdraws from the vault as well as locks and unlocks
				from the contract.
			</p>
			<p>
				Any vault withdraws will have an opportunity to utilize the freshly deposited liquidity before it gets
				locked on a first-come-first-serve basis.
			</p>
			{learnMoreLink && <AdvisoryLink href={learnMoreLink} linkText="Learn More" />}
		</GenericVaultAdvisory>
	);
};

export default AuraLockingVaultAdvisory;
