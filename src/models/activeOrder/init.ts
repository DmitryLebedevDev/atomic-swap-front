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
import {createHtlcContract} from "../../common/bitcoin/createHtlcContract";
import {dateToUtcDate} from "../../common/functions/dateToUtcDate";
// @ts-ignore
import * as bip65 from 'bip65'

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
      = userWallets[acceptedOrder.toValuePair]
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
    = userWallets[order.fromValuePair]
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

  const dateNowSec = +dateToUtcDate(new Date()) / 1000 ^ 0
  const secretNum = window.crypto.getRandomValues(new Uint32Array(1))[0];
  try {
    const hash = await createHtlcContract(
      order.toValuePair,
      userWallets[order.toValuePair].ECPair,
      fromPubKey,
      order.toValue,
      secretNum,
      bip65.encode({utc: dateNowSec+60*120})
    )
    console.log('test');
    console.log(hash);
  } catch (e) {
    console.log(e);
  }
})
startAcceptedOrderFx.failData.watch((data) => console.log(data));

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
