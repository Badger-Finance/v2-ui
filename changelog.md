# v2 UI Changelog

### 2.10.0 - 11/06/2021

- replaced at issue library causing slow app loading speeds
- minor vaults ux tweaks

### Hotfix - 11/03/2021

- fixed an issue causing no badger withdraw estimates
- update all user guide links to new badger docs
- enabled leaderboard updates per chain

### 2.9.9 - 10/29/2021

- cvx/bvecvx release
- fix incorrect byvWBTC symbol name in ibBTC module
- fix conflicting repeated sett slugs 
- fix vault detail charts not being display in mobile viewport

### 2.9.8 - 10/28/2021

- sdk integration
- cvx / bvecvx vault release
- swapr badger / eth + ibbtc / eth release

### Hotfix - 10/26/2021

- change verbiage in locked cvx banner from 'Total' to 'Total Claimed'

### 2.9.7 - 10/26/2021

- release convex locking banner

### Hotfix - 10/25/2021

- update digg oracle to chainlink forwarder

### Hotfix - 10/21/2021

- fixed an issue disallowing withdraw from detail page on some setts
- fixed a page chart styling issue

### 2.9.6 - 10/14/2021

- release mstable vaults
- minor ux tweaks for mobile
- fix guarded vault max cap ux

### Hotfix - 10/11/2021

- fix missing fee look ups

### Hotfix - 10/07/2021

- add convex delegation prompt
- add swapr vaults + user links

### 2.9.5 - 10/05/2021

-   Release Swapper vaults
-   Add tricrypto light vault
-   Refactor boost display
-   Add chain swapping to dropdown
-   Improve CI testing
-   Fix error with Coinbase wallet
-   Fix error with Digg fragments per share not being set

### 2.9.4 - 09/27/2021

-   Release Convex Locking Vault
-   Add API based fee calculation
-   Patch Badger Bridge missing icons

### Hotfix - 09/24/2021

-   Remove App Notification
-   Mobile wallet RPC fix

### Hotfix - 09/22/2021

-   Add network specific message support
-   Fix wallet connect (and other rpc wallet) connection issues

### Hotfix - 09/16/2021

-   Add curve ren and tricrypto vaults
-   Fix redirects issue for netlify deployment
-   Fix incorrect link for user guides

### 2.9.3 - 09/15/2021

-   Add arbitrum support
-   Add convex locking sett

### 2.9.2 - 09/14/2021

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

### 2.9.1 - 09/01/2021

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

### 2.9.0 - 08/26/2021

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

### 2.8.5 - 08/05/2021

-   Badger Boost 2 launch
-   Boost Optimizer release
-   API handling for more accurate pre-production environment

### Hotfix - 07/31/2021

-   restored getCurrentBlock calls to fix ibBTC ROI display

### Hotfix - 07/28/2021

-   fixed an issue causing cvxCRV wallet balances to not be displayed

### Hotfix - 07/27/2021

-   fixed an issue causing geyser unstake tab to not render
-   fixed an issue causing eth third party reward tokens to not display

### 2.8.4 - 07/22/2021

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

### 2.8.3 - 07/08/2021

-   unguard convex setts
-   informational updates to digg rebase percent display

### 2.8.2 - 07/06/2021

-   updated digg chainlink oracle contract, exposed some more rebase information

### Hotfix - 07/05/2021

-   updated digg oracle
-   fixed an issue causing account balance updates to be delayed

### 2.8.1 - 07/01/2021

-   introduced guarded vaults to the app

### Hotfix - 06/30/2021

-   fixed an issue stopping deposits on unguarded setts

### Hotfix - 06/28/2021

-   fixed an issue causing users to not be able to deposit into guarded setts when their wallet balance exceeded the cap

### 2.8.0 - 06/23/2021

-   introduced experimental vaults to the badger arcade
-   added 5 new experimental convex vaults
-   added 2 new experimental convex helper vaults

### Hotfix - 06/17/2021

-   fixed an issue with ibBTC redeem validation that was blocking all redeems

### 2.7.8 - 06/15/2021

-   fixed an issue allowing connections to unsupported networks
-   fixed an issue causing all token prices to convert incorrectly sporadically

### 2.7.7 - 06/08/2021

-   fixed wallet and assets recognition issues from the Badger Bridge
-   fixed issues on wallet disconnect and reconnect and improved connection handling

### 2.7.6 - 06/07/2021

-   handle wallet connections that do not have a provider associated with them
-   update logic on determining ROI on the ibBTC page
-   remove unnecessary getBlock calls to web3

### 2.7.5 - 06/04/2021

-   fixed an issue causing a large amount off errors when connecting to unsupported networks
-   fixed an issue causing rewards claims to fail when attempting to claim less than 1 wei of digg
-   upgraded logic for chain identification within differents pages on the dApp.

### 2.7.4 - 06/02/2021

-   fixed an issue causing underlying tokens value to display using vault token prices

### 2.7.3 - 05/30/2021

-   fixed an edge case on claim with initial token balance creation for digg
-   fixed an issue causing Infinity % rebase when no wallet is connected

### 2.7.2 - 05/29/2021

-   fix digg vault deposit
-   fix digg rewards claim
-   fix digg potential rebase %
-   add new token links

### 2.7.1 - 05/28/2021

-   Vault deposit form refactors
-   Digg balance issue fixes
-   Flagged boost v2 content (hidden)
