import { sidebarTokenLinks, SidebarLink } from 'config/ui/links';

describe('sidebarTokenLinks', () => {
	test('sidebarTokenLinks(bsc) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks('bsc')).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
	test('sidebarTokenLinks(eth) returns SidebarLink[]!', () => {
		expect(sidebarTokenLinks('eth')).toContainEqual(
			expect.objectContaining(new SidebarLink(expect.anything(), expect.anything())),
		);
	});
});
