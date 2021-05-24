import {attach, createEffect, createEvent, createStore} from "effector"
import {IuserNetworkKeys, IuserWallets} from "./types"
import {initUser} from "./initUser";
import * as bitcoinjs from 'bitcoinjs-lib'
import { bufferToHex } from "../../common/functions/bufferToHex";
import { bufferFromHex } from "../../common/functions/bufferFromHex";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";
import {payments} from "bitcoinjs-lib";

export const $userWallets = createStore<IuserWallets>(
  initUser()
)

export const updateBalanceEvent = createEvent<{network: IuserNetworkKeys, balance: number}>()

export const updateAllBalanceFx = createEffect<IuserWallets, void>()
export const startUpdateBalanceFx = attach({
  source: $userWallets,
  effect: updateAllBalanceFx
})
