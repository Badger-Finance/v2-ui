import { DEBUG } from 'config/environment';
import { ethers } from 'ethers';
import { StoreContext } from 'mobx/store-context';
import { useContext, useEffect, useState } from 'react';

const useENS = (address?: string) => {
	const store = useContext(StoreContext);
	const { provider } = store.onboard;
	const [ensName, setENSName] = useState<string | null>(null);
	const [ensAvatar, setENSAvatar] = useState<string | null>(null);

	useEffect(() => {
		const resolveENS = async () => {
			if (provider && address && ethers.utils.isAddress(address)) {
				try {
					let ensName = await provider.lookupAddress(address);
					let avatar = ensName ? await provider.getAvatar(ensName) : null;
					setENSName(ensName);
					setENSAvatar(avatar);
				} catch (e) {
          if (DEBUG) {
					  console.warn('ENS lookup encountered an error', e);
          }
				}
			}
		};
		resolveENS();
	}, [provider, address]);

	return { ensName, ensAvatar };
};

export default useENS;
