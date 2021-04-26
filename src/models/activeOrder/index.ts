import {createEffect, createEvent, createStore} from "effector"
import { Iorder } from "../orders/types"
import {IemitPubKeyToOrder} from "./types"
import {attach} from "effector/effector.cjs"
import {$userWallets} from "../user"
import {IuserWallets} from "../user/types"

export const $activeOrder = createStore<Iorder|null>(null)

export const setActiveOrderEvent = createEvent<Iorder>()
export const onSendToPairPubKey = createEvent<{hexPubKey: string}>()
export const onSendFromPairPubKey = createEvent<{hexPubKey: string}>()
export const setFromPubKeyForActiveOrderEvent = createEvent<{pubKey: Buffer}>()
export const setToPubKeyForActiveOrderEvent = createEvent<{pubKey: Buffer}>()
export const acceptOrderEvent = createEvent<number>()

export const sendPubKeyToOrderFx = createEffect<IemitPubKeyToOrder, void>()
export const acceptActiveOrderAndSendMainPubKeyFx = createEffect<
  {activeOrder: Iorder, userWallets: IuserWallets}, Iorder
>()
export const onActiveOrderFx = createEffect()
export const activeOrderFx = createEffect<
  {order: Iorder, userWallets: IuserWallets}, Iorder
>()
export const selectOrderForActiveFx = attach({
  source: $userWallets,
  effect: activeOrderFx,
  mapParams: (order: Iorder, userWallets) => ({
    order,
    userWallets
  })
})