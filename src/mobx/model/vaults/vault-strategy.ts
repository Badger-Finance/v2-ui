export interface VaultStrategy {
	address: string;
	withdrawFee: number;
	performanceFee: number;
	strategistFee: number;
}
