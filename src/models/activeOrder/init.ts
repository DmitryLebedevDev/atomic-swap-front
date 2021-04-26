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
    ([orders], acceptedOrderId) => orders.find(
      ({id}) => id === acceptedOrderId
    ) as Iorder //check undefined in filter
  ),
  filter: (order) => {
    return !!(order && order[isMainOrder])},
  target: setActiveOrderEvent
})
acceptActiveOrderAndSendMainPubKeyFx.use(async ({activeOrder, userWallets}) => {
  await sendPubKeyToOrderFx({
    id: activeOrder.id,
    hexPubKey: userWallets[activeOrder.fromValuePair].ECPair.publicKey.toString('hex'),
    keyType: "from"
  })
  setActiveOrderEvent(activeOrder);

  return activeOrder;
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

  const isMain = !!order[isMainOrder]
  const userPubKeyForOrder = userWallets[
    isMain ? order.fromValuePair : order.toValuePair
  ].ECPair.publicKey

  setActiveOrderEvent({
    ...order,
    [isMain ? 'fromPubKey' : 'toPubKey']: userPubKeyForOrder
  })

  await sendPubKeyToOrderFx({
    id: order.id,
    hexPubKey: userPubKeyForOrder.toString('hex'),
    keyType: isMain ? 'from' : 'to'
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
