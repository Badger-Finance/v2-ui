import { RenNetwork } from '@renproject/interfaces';

export const NETWORK: RenNetwork = (process.env.REACT_APP_NETWORK as RenNetwork) || RenNetwork.Mainnet;

export const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || '';
