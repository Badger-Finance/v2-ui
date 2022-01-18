import { allBonds, CitadelBond } from 'pages/CitadelEarlyBonding/bonds.config';
import { StoreContext } from 'mobx/store-context';
import { useContext, useEffect, useState } from 'react';
import { CitadelSale__factory } from '../contracts/factories/CitadelSale__factory';
import { DEBUG } from 'config/environment';

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
			const loadedBonds: CitadelBond[] = [];
			await Promise.all(
				allBonds.map(async (b) => {
					try {
						const contract = CitadelSale__factory.connect(b.bondAddress, provider);
						const [token, ended, finalized, price] = await Promise.all([
							contract.tokenIn(),
							contract.saleEnded(),
							contract.finalized(),
							contract.tokenOutPrice(),
						]);
						const bond = {
							token: b.token,
							address: token,
							price,
							finalized,
							ended,
							bondType: b.bondType,
						};
						loadedBonds.push(bond);
					} catch (err) {
						if (DEBUG) {
							console.error(`Failed to load ${b.token} ${b.bondType} bond!`);
							console.error(err);
						}
					}
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
