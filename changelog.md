# v2 UI Changelog

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
