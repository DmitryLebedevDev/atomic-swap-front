import {createEffect, createEvent, createStore} from "effector"
import { Iorder } from "../orders/types"
import {IemitPubKeyToOrder} from "./types"
import {attach} from "effector/effector.cjs"
import {$userWallets} from "../user"
import {IuserWallets} from "../user/types"
import { $orders } from "../orders";

export const $activeOrder = createStore<Iorder|null>(null)

export const setActiveOrderEvent = createEvent<Iorder>()
export const onSendToPairPubKey = createEvent<{hexPubKey: string}>()
export const onSendFromPairPubKey = createEvent<{hexPubKey: string}>()
export const setFromPubKeyForActiveOrderEvent = createEvent<{pubKey: Buffer}>()
export const setToPubKeyForActiveOrderEvent = createEvent<{pubKey: Buffer}>()

export const sendPubKeyToOrderFx = createEffect<IemitPubKeyToOrder, void>()

export const startAcceptedOrderFx = createEffect<
  {acceptedOrderId: number, orders: Iorder[], userWallets: IuserWallets}, void
>()
export const onActiveOrderFx = attach({
  source: {
    orders: $orders,
    userWallets: $userWallets,
  },
  mapParams: (acceptedOrderId: number, {orders, userWallets}) => ({
    acceptedOrderId,
    orders,
    userWallets
  }),
  effect: startAcceptedOrderFx
})
export const activeOrderFx = createEffect<
  {order: Iorder, userWallets: IuserWallets}, void
>()
export const selectOrderForActiveFx = attach({
  source: $userWallets,
  effect: activeOrderFx,
  mapParams: (order: Iorder, userWallets) => ({
    order,
    userWallets
  })
})