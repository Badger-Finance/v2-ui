import React from 'react';
import AdvisoryLink from './AdvisoryLink';
import GenericVaultAdvisory, { VaultAdvisoryBaseProps } from './GenericVaulAdvisory';

const ChadgerVaultAdvisory = ({ accept }: VaultAdvisoryBaseProps): JSX.Element => {
	return (
		<GenericVaultAdvisory accept={accept}>
			<p>
			This is a Chadger Vault, meaning a highly experimental vault that builds on new protocols. This vault carries higher levels of liquidity and smart contract risk than normal Badger Vaults.
			</p>
			<p>
				Ape at your own risk.
			</p>
		</GenericVaultAdvisory>
	);
};

export default ChadgerVaultAdvisory;
