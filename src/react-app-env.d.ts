/// <reference types="react-scripts" />
declare module 'web3-batch-call';

interface Window {
	ethereum?: {
		isMetaMask?: true;
		request?: (...args: any[]) => Promise<void>;
	};
}
