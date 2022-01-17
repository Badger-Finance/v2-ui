import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { CitadelBond } from './bonds.config';

export async function bondToCitadel(bond: CitadelBond, amount: TokenBalance): Promise<void> {
	console.log(`Triggered a bonding event for ${bond.token} (${amount.balanceDisplay()})`);
}
