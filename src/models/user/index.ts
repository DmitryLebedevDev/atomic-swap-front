import {attach, createEffect, createEvent, createStore} from "effector"
import {IuserNetworkKeys, IuserWallets} from "./types"
import {initUser} from "./initUser"

export const $userWallets = createStore<IuserWallets>(
  initUser()
)

export const updateBalanceEvent = createEvent<{network: IuserNetworkKeys, balance: number}>()

export const updateAllBalanceFx = createEffect<IuserWallets, void>()
export const startUpdateBalanceFx = attach({
  source: $userWallets,
  effect: updateAllBalanceFx
})
