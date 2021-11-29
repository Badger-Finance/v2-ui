export const MIN_AMOUNT = 0.002;

export enum BridgeMintOption {
	renBTC = 'renBTC',
	WBTC = 'WBTC',
	byvWBTC = 'byvWBTC',
	bCRVrenBTC = 'bCRVrenBTC',
	bCRVsBTC = 'bCRVsBTC',
	bCRVtBTC = 'bCRVtBTC',
	ibBTC = 'ibBTC',
	bCRVibBTC = 'bCRVibBTC',
}

//enum mapping each badger vault to its respective curve pool ID
export enum BridgePool {
	renCrv = 0,
	sbtcCrv = 1,
	tbtcCrv = 2,
	wBtc = 3,
}
