import {combine, createEffect, createEvent, createStore} from "effector";
import { Iorder } from "../orders/types";
import {IemitPubKeyToOrder} from "./types";
import {attach} from "effector/effector.cjs";
import {$userWallets} from "../user";
import {isMainOrder} from "../orders";

export const $activeOrder = createStore<Iorder|null>(null);

export const setActiveOrderEvent = createEvent<Iorder>();
export const setFromPubKeyForActiveOrderEvent = createEvent<Buffer>();
export const setToPubKeyForActiveOrderEvent = createEvent<Buffer>();
export const acceptOrderEvent = createEvent<number>();

export const sendPubKeyToOrderFx = createEffect<IemitPubKeyToOrder | null, void>();
export const selectPubkeyForActiveOrderAndSendFx = attach({
  source: combine({
    userWallets: $userWallets,
    activeOrder: $activeOrder,
  }),
  effect: sendPubKeyToOrderFx,
  mapParams: (_, {userWallets, activeOrder}) => {
    if(activeOrder) {
      const isFrom = !!activeOrder[isMainOrder];
      const userPair = isFrom ?
        activeOrder.fromValuePair : activeOrder.toValuePair
      return {
         id: activeOrder.id,
         pubkey: userWallets[userPair].ECPair.publicKey.toString('hex'),
         isFrom
      }
    }
    return null;
  }
})

export const activeOrderFx = createEffect<Iorder, void>();