import { NETWORK_LIST } from 'config/constants';
import { sidebarTokenLinks, SidebarLink } from 'config/ui/links';
import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';

describe('sidebarTokenLinks', () => {
	test('sidebarTokenLinks(BSC) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks(NETWORK_LIST.BSC)).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('sidebarTokenLinks(ETH) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks(NETWORK_LIST.ETH)).toContainEqual(
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
		expect(new BinanceSmartChain().sidebarTokenLinks).toEqual(sidebarTokenLinks(NETWORK_LIST.BSC));
	});
	test('EthNetwork.sidebarTokenLinks === sidebarTokenLinks(ETH)', () => {
		expect(new Ethereum().sidebarTokenLinks).toEqual(sidebarTokenLinks(NETWORK_LIST.ETH));
	});
});
