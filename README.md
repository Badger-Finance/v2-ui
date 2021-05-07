# BADGER V2 UI

This is the Badger V2 UI, based in typescript and React.

## Install

This is a React app that has prerequisites of `yarn` to install dependencies.

To run locally:

```
yarn
yarn start
```

This will expose the app on `localhost:3000` and use the network to which your connected wallet is direct to. The networks available are the completed classes in the `mobx/model.ts` file.

## How To:

### Whitelist / Unwhitelist a Vault

Vaults can be added to a whitelist that is provided by the API. To enforce this on a specific vault, you'd add it to the `isWhitelisted` property on the network class the vault is applicable to.

### Add a New Vault

_Note: The API must be updated for both the sett information and the pricing information for the vault to be active_

-   A vault is added by updating the configurations of:
-   `config/system/tokens.ts` - Update config to include the new tokens (including underlying, any LP tokens and the vault token)
-   `config/system/vaults.ts` - Add the vault to the config file
-   `mobx/model.ts` - Add vault to the `settOrder` property on the network it is for
-   Add images to `public/assets/icons` - Include both the underlying tokens and the vault tokens. Filenames should match the `asset` property in the setts API return and named in all lowercase letters

#### Tokens

_TODO: Deprecate this to use the data provided from the API_
This file hosts all of the information for every token, including the decimals, symbols and other display data. If you're adding a new vault, make sure to add in the token information for both the vault and the underlying token / tokens if they are new.

#### Vaults

_TODO: Review batch information to see what is duplicated by the API and remove the calls_
This file hosts the data used to create / populate the vault data. The batch data is used to call the blockchain, so we need to ensure that the contracts have the correct ABIs, or create a new entry in the object with the correct methods.

#### Model

The network class needs to be updated to include the new vault in the `settOrder` property as well as optionally added to the `isWhitelisted` or `cappedDeposit` / `uncappedDeposit` properties

#### Images

Tokens pull their images from the `public/assets/icons` folder. They are organized by the `sett.asset.toLowerCase()` - for example: `slp-badger-wbtc.png` for the Sushi LP Badger/WBTC Token.
