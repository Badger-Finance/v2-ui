/* Deployment Configuration Constants */

// deployment stage definitions
enum Stage {
  Local = 'local',
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
    case Stage.Development:
      return Stage.Development;
    default:
      return Stage.Local;
  }
}

/**
 * resolve the integration stage for the application.
 * the badger api only contains two stages - staging and production.
 * development, and experimental apps utilize the staging api integration.
 * staging and production apps utilize the production api integration.
 */
function getIntegrationStage(stage: Stage) {
  if (stage === Stage.Experimental || stage === Stage.Development || stage === Stage.Local) {
    return Stage.Staging;
  }
  return Stage.Production;
}

// expose the build env as a global constant
export const BUILD_ENV = getStage(process.env.REACT_APP_BUILD_ENV);
// debugging flag available on non-prod equivalent deployments
export const DEBUG = getIntegrationStage(BUILD_ENV) === Stage.Staging;

export const LOCAL = BUILD_ENV === Stage.Local;

export const getApi = (): string => {
  if (DEBUG) {
    return 'https://staging-api.badger.com';
  }
  return 'https://api.badger.com';
};

export const BADGER_API = getApi();

/* App Feature Flags */

const toBool = (val: string | undefined): boolean => (val ? val.toLowerCase() === 'true' : false);

export const FLAGS = {
  GRAVIAURA_CHART: toBool(process.env.REACT_APP_GRAVIAURA_CHART),
};

export const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
