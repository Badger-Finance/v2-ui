import '@testing-library/jest-dom';

import { BigNumber } from 'ethers';
import React from 'react';

import { OptionTokens } from '../../../components/IbBTC/OptionTokens';
import { TokenBalance } from '../../../mobx/model/tokens/token-balance';
import { customRender, fireEvent, screen, within } from '../../Utils';

const tokens = [
  new TokenBalance(
    { name: 'bcrvRenBTC', symbol: 'bcrvRenBTC', address: '0x0', decimals: 18 },
    BigNumber.from(0),
    0,
  ),
  new TokenBalance(
    {
      name: 'bcrvRenSBTC',
      symbol: 'bcrvRenSBTC',
      address: '0x1',
      decimals: 18,
    },
    BigNumber.from(0),
    0,
  ),
  new TokenBalance(
    { name: 'bcrvTBTC', symbol: 'bcrvTBTC', address: '0x2', decimals: 18 },
    BigNumber.from(0),
    0,
  ),
];

it('starts with the first token as default value', () => {
  customRender(
    <OptionTokens
      selected={tokens[0]}
      balances={tokens}
      onTokenSelect={jest.fn()}
    />,
  );
  expect(
    screen.getByRole('button', { name: tokens[0].token.name }),
  ).toBeInTheDocument();
});

it.each(tokens)('displays token information', (option) => {
  customRender(
    <OptionTokens
      selected={tokens[0]}
      balances={tokens}
      onTokenSelect={jest.fn()}
    />,
  );
  fireEvent.mouseDown(screen.getByRole('button'), { name: option.token.name });
  expect(
    within(screen.getByRole('listbox')).getByRole('option', {
      name: option.token.name,
    }),
  ).toBeInTheDocument();
});

it.each(tokens)(
  'triggers on token select handler with correct information',
  (option) => {
    const handleClick = jest.fn();
    customRender(
      <OptionTokens
        selected={tokens[0]}
        balances={tokens}
        onTokenSelect={handleClick}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('button'), {
      name: option.token.name,
    });
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: option.token.name,
      }),
    );
    expect(handleClick).toHaveBeenNthCalledWith(1, option);
  },
);
