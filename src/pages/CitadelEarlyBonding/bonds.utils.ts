import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { IBond } from './bonds.config';

export async function bondToCitadel(bond: IBond, amount: TokenBalance): Promise<void> {
	console.log(`Triggered a bonding event for ${bond.token} (${amount.balanceDisplay()})`);
}
