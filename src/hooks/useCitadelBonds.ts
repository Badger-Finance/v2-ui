import { allBonds, CitadelBond } from 'pages/CitadelEarlyBonding/bonds.config';
import { StoreContext } from 'mobx/store-context';
import { useContext, useEffect, useState } from 'react';
import { CitadelSale__factory } from '../contracts/factories/CitadelSale__factory';

interface CitadelBonds {
	presaleBonds: CitadelBond[];
}

function useCitadelBonds(): CitadelBonds {
	const store = useContext(StoreContext);
	const { provider } = store.onboard;

	const [citadelBonds, setCitadelBonds] = useState<CitadelBond[]>([]);

	useEffect(() => {
		async function loadCitadelBonds() {
			if (!provider) {
				return;
			}
			const loadedBonds = await Promise.all(
				allBonds.map(async (b): Promise<CitadelBond> => {
					const contract = CitadelSale__factory.connect(b.bondAddress, provider);
					const [token, ended, finalized, price] = await Promise.all([
						contract.tokenIn(),
						contract.saleEnded(),
						contract.finalized(),
						contract.tokenOutPrice(),
					]);
					return {
						token: b.token,
						address: token,
						price,
						finalized,
						ended,
						bondType: b.bondType,
					};
				}),
			);
			setCitadelBonds(loadedBonds);
		}
		loadCitadelBonds();
	}, [provider]);

	return {
		presaleBonds: citadelBonds,
	};
}

export default useCitadelBonds;
