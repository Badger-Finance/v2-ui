import { NETWORK_LIST } from 'config/constants';
import { sidebarTokenLinks, SidebarLink } from 'config/ui/links';
import { BscNetwork } from '../../mobx/model/network/bscNetwork';
import { EthNetwork } from '../../mobx/model/network/ethNetwork';

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
		expect(new BscNetwork().sidebarTokenLinks).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('EthNetwork.sidebarTokenLinks returns SidebarLink[]!', () => {
		expect(new EthNetwork().sidebarTokenLinks).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('BscNetwork.sidebarTokenLinks === sidebarTokenLinks(BSC)', () => {
		expect(new BscNetwork().sidebarTokenLinks).toEqual(sidebarTokenLinks(NETWORK_LIST.BSC));
	});
	test('EthNetwork.sidebarTokenLinks === sidebarTokenLinks(ETH)', () => {
		expect(new EthNetwork().sidebarTokenLinks).toEqual(sidebarTokenLinks(NETWORK_LIST.ETH));
	});
});
