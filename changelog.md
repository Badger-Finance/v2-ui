# v2 UI Changelog

### v2.9.2 - 09/14/2021

-   Update sett detail charting library
-   Add badger boost chart
-   Add support for EIP-1559 transactions

### Hotfix - 09/08/2021

-   Add arbitrum support for sidebar
-   Update sett detail page to properly breadcrumb back to correct page

### Hotfix - 09/03/2021

-   Modify DROPT redemption to handle small redemption amounts

### Hotfix - 09/01/2021

-   Add links to other vault pages when no vaults exist
-   Add bouncer check to sett details page
-   Prevent display of dropt modal if user doesn't have any balance

### v2.9.1 - 09/01/2021

-   Release matic support

### Hotfix - 08/30/2021

-   Add DROPT-3 token reward config
-   Fix issue with DROPT-3 token balance not being tracked
-   Fix incorrect timestamp check
-   Properly display rewards for addresses with only DROPT-3 tokens

### Hotfix - 08/27/2021

-   Fix issue causing users to not be able to withdraw
-   Fix issue causing fee display to show improper amount
-   Update tooltip to support user specific apr display

### v2.9.0 - 08/26/2021

-   Initial App refresh launched
-   RenJS upgrade for Badger Bridge
-   update user token distribution tooltip

### Hotfix - 08/17/2021

-   Add RenVM Fee to Bridge Fee Display

### Hotfix - 08/09/2021

-   Add more detailed information to the INFO tab for each vault

### Hotfix - 08/07/2021

-   fix "My boost" apy showing on non-emission setts
-   correct fee for tricrypto1 pool
-   update tooltip to show user specific ROI

### Hotfix - 08/06/2021

-   Add tricrypto2 sett
-   Remove fees from tricrypto (old) sett
-   Fix notify.js link
-   Add deprecated vault handling
-   improved digg reporting
-   fix "My boost" apy showing on non-emission setts
-   correct fee for tricrypto1 pool

### v2.8.5 - 08/05/2021

-   Badger Boost v2 launch
-   Boost Optimizer release
-   API handling for more accurate pre-production environment

### Hotfix - 07/31/2021

-   restored getCurrentBlock calls to fix ibBTC ROI display

### Hotfix - 07/28/2021

-   fixed an issue causing cvxCRV wallet balances to not be displayed

### Hotfix - 07/27/2021

-   fixed an issue causing geyser unstake tab to not render
-   fixed an issue causing eth third party reward tokens to not display

### v2.8.4 - 07/22/2021

-   update boost leaderboard visualization
-   revert digg oracle back to centralizedOracle

### Hotfix - 07/17/2021

-   update links to strategies

### Hotfix - 07/14/2021

-   reset currency to usd when the wallet's network changes

### Hotfix - 07/13/2021

-   use onboard's app network id as fallback in case the provider's chain id is not available while getting wallet's network

### Hotfix - 07/12/2021

-   add refresh when connecting wallet to set provider correctly
-   remove double negative on digg rebase display
-   reorder sidebar

### Hotfix - 07/11/2021

-   update convex sett fees

### Hotfix - 07/08/2021

-   update checks during wallet connection to allow for non-provider wallets to connect
-   update RPC link

### v2.8.3 - 07/08/2021

-   unguard convex setts
-   informational updates to digg rebase percent display

### v2.8.2 - 07/06/2021

-   updated digg chainlink oracle contract, exposed some more rebase information

### Hotfix - 07/05/2021

-   updated digg oracle
-   fixed an issue causing account balance updates to be delayed

### v2.8.1 - 07/01/2021

-   introduced guarded vaults to the app

### Hotfix - 06/30/2021

-   fixed an issue stopping deposits on unguarded setts

### Hotfix - 06/28/2021

-   fixed an issue causing users to not be able to deposit into guarded setts when their wallet balance exceeded the cap

### v2.8.0 - 06/23/2021

-   introduced experimental vaults to the badger arcade
-   added 5 new experimental convex vaults
-   added 2 new experimental convex helper vaults

### Hotfix - 06/17/2021

-   fixed an issue with ibBTC redeem validation that was blocking all redeems

### v2.7.8 - 06/15/2021

-   fixed an issue allowing connections to unsupported networks
-   fixed an issue causing all token prices to convert incorrectly sporadically

### v2.7.7 - 06/08/2021

-   fixed wallet and assets recognition issues from the Badger Bridge
-   fixed issues on wallet disconnect and reconnect and improved connection handling

### v2.7.6 - 06/07/2021

-   handle wallet connections that do not have a provider associated with them
-   update logic on determining ROI on the ibBTC page
-   remove unnecessary getBlock calls to web3

### v2.7.5 - 06/04/2021

-   fixed an issue causing a large amount off errors when connecting to unsupported networks
-   fixed an issue causing rewards claims to fail when attempting to claim less than 1 wei of digg
-   upgraded logic for chain identification within differents pages on the dApp.

### v2.7.4 - 06/02/2021

-   fixed an issue causing underlying tokens value to display using vault token prices

### v2.7.3 - 05/30/2021

-   fixed an edge case on claim with initial token balance creation for digg
-   fixed an issue causing Infinity % rebase when no wallet is connected

### v2.7.2 - 05/29/2021

-   fix digg vault deposit
-   fix digg rewards claim
-   fix digg potential rebase %
-   add new token links

### v2.7.1 - 05/28/2021

-   Vault deposit form refactors
-   Digg balance issue fixes
-   Flagged boost v2 content (hidden)
