import {
  $activeOrder,
  activeOrderFx,
  onActiveOrderFx,
  onSendFromPairPubKey,
  onSendToPairPubKey,
  sendPubKeyToOrderFx,
  setActiveOrderEvent,
  setFromPubKeyForActiveOrderEvent,
  setToPubKeyForActiveOrderEvent,
  startAcceptedOrderFx
} from ".";
import { wsClient, wsClientEmitP, wsClientOnP } from "../../api/ws";
import { isMainOrder } from "../orders"
import { Iorder } from "../orders/types"
import { bufferFromHex } from "../../common/functions/bufferFromHex"
import {$userWallets} from "../user";
import * as bitcoinjs from 'bitcoinjs-lib';
import {createHtlcScript} from "../../common/bitcoin/createHtlcScript";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";
import { createEffect } from "effector/effector.cjs";
import { IemitPubKeyToOrder } from "./types";

wsClient.on('sendToPairPubKey', onSendToPairPubKey)
wsClient.on('sendFromPairPubKey', onSendFromPairPubKey)

sendPubKeyToOrderFx.use(async (sendInfo) => {
  const {keyType, ...idOrderAndPubkey} = sendInfo
  return wsClientEmitP(
    keyType === 'from' ? 'sendFromPairPubKey' : 'sendToPairPubKey',
    idOrderAndPubkey
  )
})

wsClient.on('acceptOrder', onActiveOrderFx)
startAcceptedOrderFx.use(
  async ({acceptedOrderId, orders, userWallets}) => {
    const acceptedOrder = orders.find(
      (order) => order.id === acceptedOrderId && order[isMainOrder]
    )
    if(!acceptedOrder) {throw new Error('not find main order')}

    const fromPubKey
      = userWallets[acceptedOrder.fromValuePair]
          .ECPair
          .publicKey
    const toPubKey
      = await wsClientOnP(
        'sendToPairPubKey',
        ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
          return bufferFromHex(hexPubKey);
        }
      )

    setActiveOrderEvent({
      ...acceptedOrder,
      fromPubKey
    });
    setToPubKeyForActiveOrderEvent({pubKey: toPubKey});

    await sendPubKeyToOrderFx({
      id: acceptedOrder.id,
      hexPubKey: fromPubKey.toString('hex'),
      keyType: 'from'
    })
  }
)

activeOrderFx.use(async ({order, userWallets}) => {
  await wsClientEmitP('acceptOrder', order.id)

  const toPubKey
    = userWallets[order.toValuePair]
        .ECPair
        .publicKey;
  order.toPubKey = toPubKey;
  setActiveOrderEvent({...order});

  await sendPubKeyToOrderFx({
    id: order.id,
    hexPubKey: toPubKey.toString('hex'),
    keyType: 'to'
  })

  const fromPubKey
    = await wsClientOnP(
      'sendFromPairPubKey',
      ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
        return bufferFromHex(hexPubKey);
      }
    )
  order.fromPubKey = fromPubKey;
  setFromPubKeyForActiveOrderEvent({pubKey: fromPubKey});
})

$activeOrder
  .on(setActiveOrderEvent, (_, order) => order)
  .on(
    setToPubKeyForActiveOrderEvent,
    (order, {pubKey: toPubKey}) => order ? ({...order, toPubKey}) : null
  )
  .on(
    setFromPubKeyForActiveOrderEvent,
    (order, {pubKey: fromPubKey}) => order ? ({...order, fromPubKey}) : null
  )
