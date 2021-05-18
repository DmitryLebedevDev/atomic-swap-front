import {$userWallets, updateAllBalanceFx, updateBalanceEvent} from "./index";
import {getAddressBalanceReq} from "../../api/rest";
import {IuserNetworkKeys} from "./types";
//
// updateAllBalanceFx.use((wallets) => {
//   Promise.all(
//     Object.entries(wallets).map(([network, walletInfo]) => {
//       getAddressBalanceReq(network, walletInfo.address)
//       .then(balance => {
//         updateBalanceEvent(network)
//       })
//     })
//   )
// })

$userWallets.on(updateBalanceEvent, (wallets, {wallet, balance}) => ({
  ...wallets,
  [wallet]: {
    ...wallets[wallet],
    balance
  }
}))