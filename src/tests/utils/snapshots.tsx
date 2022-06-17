import store from 'mobx/stores/RootStore';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { customRender } from 'tests/Utils';

export const TEST_ADDRESS = '0x03f7724180AA6b939894B5Ca4314783B0b36b329';
export function checkSnapshot(component: JSX.Element): void {
	const { container } = customRender(<StoreProvider value={store}>{component}</StoreProvider>);
	expect(container).toMatchSnapshot();
}
