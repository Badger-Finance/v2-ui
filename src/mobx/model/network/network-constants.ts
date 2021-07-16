import { DeployConfig } from '../system-config/deploy-config';

export type NetworkConstants = {
	[index: string]: {
		APP_URL: string;
		RPC_URL: string;
		START_BLOCK: number;
		START_TIME: Date;
		DEPLOY: DeployConfig;
	};
};
