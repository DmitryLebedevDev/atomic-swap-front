import {$userWallets, updateAllBalanceFx, updateBalanceEvent} from "./index";
import {getAddressBalanceReq} from "../../api/rest";
import {IuserNetworkKeys, Iwallet} from "./types";

updateAllBalanceFx.use(async (wallets) => {
  await Promise.all(
    Object.entries(wallets).map(([network, walletInfo]) => {
      getAddressBalanceReq(network as IuserNetworkKeys, walletInfo.address)
      .then(balance => {
        updateBalanceEvent({
          network: network as IuserNetworkKeys,
          balance
        })
      })
    })
  )
})

$userWallets.on(updateBalanceEvent, (wallets, {network, balance}) => ({
  ...wallets,
  [network]: {
    ...wallets[network],
    balance
  }
}))