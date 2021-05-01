import {Event, guard, sample} from "effector"
import {
  $activeOrder, acceptActiveOrderAndSendMainPubKeyFx,
  acceptOrderEvent,
  activeOrderFx,
  onSendFromPairPubKey,
  onSendToPairPubKey,
  sendPubKeyToOrderFx,
  setActiveOrderEvent,
  setFromPubKeyForActiveOrderEvent,
  setToPubKeyForActiveOrderEvent
} from "."
import { wsClient, wsClientEmitP } from "../../api/ws"
import { $orders, isMainOrder } from "../orders"
import { Iorder } from "../orders/types"
import { bufferFromHex } from "../../common/functions/bufferFromHex"
import {$userWallets} from "../user";
import * as bitcoinjs from 'bitcoinjs-lib';
import {createHtlcScript} from "../../common/bitcoin/createHtlcScript";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";

const guardForSetPubKeyForActiveOrder = (
  source: Event<{hexPubKey: string}>,
  filter: (info: {isMain: boolean | null}) => boolean,
  event: Event<{pubKey: Buffer}>
) => ({
  source: sample(
    $activeOrder, source,
    (activeOrder, {hexPubKey}) => {
      return {
        isMain: activeOrder ?
          !!activeOrder[isMainOrder] : null,
        pubKey: bufferFromHex(hexPubKey)
      }
    }
  ),
  filter,
  target: event
})
wsClient.on('sendToPairPubKey', onSendToPairPubKey)
guard(guardForSetPubKeyForActiveOrder(
  onSendToPairPubKey,
  ({isMain}) => isMain === null ? false : isMain,
  setToPubKeyForActiveOrderEvent
))
wsClient.on('sendFromPairPubKey', onSendFromPairPubKey)
guard(guardForSetPubKeyForActiveOrder(
  onSendFromPairPubKey,
  ({isMain}) => isMain === null ? false : !isMain,
  setFromPubKeyForActiveOrderEvent
))

wsClient.on('acceptOrder', acceptOrderEvent)
guard({
  source: sample(
    [$orders, $userWallets], acceptOrderEvent,
    ([orders, userWallets], acceptedOrderId) => {
      const activeOrder = orders.find(
        ({id}) => id === acceptedOrderId
      )
      if(activeOrder) {
        activeOrder.fromPubKey = userWallets[activeOrder.fromValuePair].ECPair.publicKey;
      }

      return {activeOrder: activeOrder as Iorder}
    } //check undefined in filter
  ),
  filter: ({activeOrder}) => {
    return !!(activeOrder && activeOrder[isMainOrder])},
  target: acceptActiveOrderAndSendMainPubKeyFx
})
acceptActiveOrderAndSendMainPubKeyFx.use(async ({activeOrder}) => {
  if(activeOrder.fromPubKey) {
    await sendPubKeyToOrderFx({
      id: activeOrder.id,
      hexPubKey: activeOrder.fromPubKey.toString('hex'),
      keyType: "from"
    })
    setActiveOrderEvent(activeOrder);

    return activeOrder;
  }
  throw new Error('not fromPubKey');
})
sendPubKeyToOrderFx.use(async (sendInfo) => {
  const {keyType, ...idOrderAndPubkey} = sendInfo
  return wsClientEmitP(
    keyType === 'from' ? 'sendFromPairPubKey' : 'sendToPairPubKey',
    idOrderAndPubkey
  )
})

activeOrderFx.use(async ({order, userWallets}) => {
  await wsClientEmitP('acceptOrder', order.id)

  const userPubKeyForOrder = userWallets[order.toValuePair].ECPair.publicKey;

  const activeOrder = {
    ...order,
    toPubKey: userPubKeyForOrder
  }

  setActiveOrderEvent(activeOrder)

  await sendPubKeyToOrderFx({
    id: order.id,
    hexPubKey: userPubKeyForOrder.toString('hex'),
    keyType: 'to'
  })

  return order
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
