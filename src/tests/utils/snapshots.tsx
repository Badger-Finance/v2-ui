import store from 'mobx/stores/RootStore';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { customRender } from 'tests/Utils';

export function checkSnapshot(component: JSX.Element): void {
  const { container } = customRender(<StoreProvider value={store}>{component}</StoreProvider>);
  expect(container).toMatchSnapshot();
}
