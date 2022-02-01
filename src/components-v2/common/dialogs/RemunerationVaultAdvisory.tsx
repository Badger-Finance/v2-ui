import { Link } from '@material-ui/core';
import React from 'react';
import AdvisoryLink from './AdvisoryLink';
import GenericVaultAdvisory, { VaultAdvisoryBaseProps } from './GenericVaulAdvisory';

const RemunerationVaultAdvisory = ({ accept }: VaultAdvisoryBaseProps): JSX.Element => {
	return (
		<GenericVaultAdvisory accept={accept}>
			<p>Withdrawing from your remBADGER position is a one-way transaction.</p>
			<p>
				Once withdrawn, you will not be able to re-deposit,
				and as a result, agree to forfeit any future accrued
				Badger rewards emitted throughout the designated restitution
				period as outlined in <Link href="https://forum.badger.finance/t/bip-80-restitution-of-non-recoverable-assets-via-rembadger-sett/5362">BIP 81</Link>.
			</p>
			<p>The amount of redeemable remBADGER will depend on when it’s withdrawn and will increase over time as additional funds are added to the vault by BadgerDAO.</p>
      <AdvisoryLink href="https://docs.badger.com/badger-finance/sett-user-guides/blcvx-locked-convex" linkText="Learn More" />
		</GenericVaultAdvisory>
	);
};

export default RemunerationVaultAdvisory;
