/**
 * RTL Wrapper to disable MUI's dynammic JSS classes generation
 * Credits: @lookfirst
 */
import { createGenerateClassName, StylesProvider } from '@material-ui/core/styles';
import { render as tlRender, RenderOptions } from '@testing-library/react';
import mediaQuery from 'css-mediaquery';
import React, { ReactElement } from 'react';

interface Props {
  children: React.ReactNode;
}

function MyStyles({ children }: Props) {
  // make a copy of the data because the state is mutated below in one of the tests for clicks
  // then the state is used again for comparison later, which causes tests to be dependent on execution
  // order and fail.
  const generateClassName = createGenerateClassName({
    disableGlobal: true,
    productionPrefix: 'test',
  });

  return <StylesProvider generateClassName={generateClassName}>{children}</StylesProvider>;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  tlRender(ui, { wrapper: MyStyles, ...options });

export function createMatchMedia(width: number) {
  return (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addListener: () => jest.fn(),
    removeListener: () => jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender };
