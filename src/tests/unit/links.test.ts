import { ChainNetwork } from 'config/enums/chain-network.enum';
import { sidebarTokenLinks, SidebarLink } from 'config/ui/links';
import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';

describe('sidebarTokenLinks', () => {
	test('sidebarTokenLinks(BSC) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks(ChainNetwork.BinanceSmartChain)).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('sidebarTokenLinks(ETH) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks(ChainNetwork.Ethereum)).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('BscNetwork.sidebarTokenLinks returns SidebarLink[]!', () => {
		expect(new BinanceSmartChain().sidebarTokenLinks).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('EthNetwork.sidebarTokenLinks returns SidebarLink[]!', () => {
		expect(new Ethereum().sidebarTokenLinks).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('BscNetwork.sidebarTokenLinks === sidebarTokenLinks(BSC)', () => {
		expect(new BinanceSmartChain().sidebarTokenLinks).toEqual(sidebarTokenLinks(ChainNetwork.BinanceSmartChain));
	});
	test('EthNetwork.sidebarTokenLinks === sidebarTokenLinks(ETH)', () => {
		expect(new Ethereum().sidebarTokenLinks).toEqual(sidebarTokenLinks(ChainNetwork.Ethereum));
	});
});
