import { Network } from '../mobx/model/network/network';
import { DeprecatedVaultWarningInfo } from '../mobx/model/vaults/deprecated-vault-warning-info';

type Config = {
	[networkId: Network['id']]: Record<string, DeprecatedVaultWarningInfo>;
};

//TODO: get this info from marcom team
export const DEPRECATED_VAULT_WARNINGS_INFO: Config = {};
