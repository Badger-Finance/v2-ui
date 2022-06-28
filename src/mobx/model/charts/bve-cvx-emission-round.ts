export interface BveCvxEmissionRound {
	// TODO: consider making this actually generic and usable
	badger: number;
	badgerValue: number;
	bveCVX: number;
	bveCVXValue: number;
	bcvxCrv: number;
	bcvxCrvValue: number;

	vaultTokens: number;
	vaultValue: number;

	start: number;
	index: number;
}
