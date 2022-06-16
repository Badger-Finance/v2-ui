/* Deployment Configuration Constants */

// deployment stage definitions
enum Stage {
	Experimental = 'experimental',
	Development = 'development',
	Staging = 'staging',
	Production = 'production',
}

// resolve deployment stage from env variable, default to development
function getStage(stage?: string) {
	switch (stage) {
		case Stage.Experimental:
			return Stage.Experimental;
		case Stage.Staging:
			return Stage.Staging;
		case Stage.Production:
			return Stage.Production;
		default:
			return Stage.Development;
	}
}

/**
 * resolve the integration stage for the application.
 * the badger api only contains two stages - staging and production.
 * development, and experimental apps utilize the staging api integration.
 * staging and production apps utilize the production api integration.
 */
function getIntegrationStage(stage: Stage) {
	if (stage === Stage.Experimental || stage === Stage.Development) {
		return Stage.Staging;
	}
	return Stage.Production;
}

// expose the build env as a global constant
export const BUILD_ENV = getStage(process.env.REACT_APP_BUILD_ENV);
// debugging flag available on non-prod equivalent deployments
export const DEBUG = getIntegrationStage(BUILD_ENV) === Stage.Staging;

/* App Feature Flags */

const toBool = (val: string | undefined): boolean => (val ? val.toLowerCase() === 'true' : false);

export const FLAGS = {
	SDK_INTEGRATION_ENABLED: toBool(process.env.REACT_APP_SDK_INTEGRATION),
	GOVERNANCE_TIMELOCK: toBool(process.env.REACT_APP_GOVERNANCE_TIMELOCK),
};
