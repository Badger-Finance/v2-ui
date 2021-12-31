import React from 'react';
import '@testing-library/jest-dom';
import { customRender, screen, fireEvent, within } from '../../Utils';
import { OptionTokens } from '../../../components/IbBTC/OptionTokens';
import { TokenBalance } from '../../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';

const tokens = [
  new TokenBalance(
    { name: 'bcrvRenBTC', symbol: 'bcrvRenBTC', address: '0x0', decimals: 18 },
    new BigNumber(0),
    new BigNumber(0),
  ),
  new TokenBalance(
    { name: 'bcrvRenSBTC', symbol: 'bcrvRenSBTC', address: '0x1', decimals: 18 },
    new BigNumber(0),
    new BigNumber(0),
  ),
  new TokenBalance(
    { name: 'bcrvTBTC', symbol: 'bcrvTBTC', address: '0x2', decimals: 18 },
    new BigNumber(0),
    new BigNumber(0),
  ),
];

it('starts with the first token as default value', () => {
  customRender(<OptionTokens selected={tokens[0]} balances={tokens} onTokenSelect={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'token options' })).toBeInTheDocument();
});

it.each(tokens)('displays token information', (option) => {
  customRender(<OptionTokens selected={tokens[0]} balances={tokens} onTokenSelect={jest.fn()} />);
  fireEvent.click(screen.getByRole('button'), { name: `${option.token.name} icon` });
  expect(within(screen.getByRole('tooltip')).getByText(option.token.symbol)).toBeInTheDocument();
});

it.each(tokens)('triggers on token select handler with correct information', (option) => {
  const handleClick = jest.fn();
  customRender(<OptionTokens selected={tokens[0]} balances={tokens} onTokenSelect={handleClick} />);
  fireEvent.click(screen.getByRole('button'), { name: `${option.token.name} icon` });
  fireEvent.click(within(screen.getByRole('tooltip')).getByText(option.token.symbol));
  expect(handleClick).toHaveBeenNthCalledWith(1, option);
});
