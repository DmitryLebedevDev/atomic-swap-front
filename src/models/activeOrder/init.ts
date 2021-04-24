import {attach, forward, guard, sample} from "effector";
import {
  $activeOrder,
  acceptOrderEvent,
  activeOrderFx, sendPubKeyToOrderFx,
  setActiveOrderEvent,
  setFromPubKeyForActiveOrderEvent,
  setToPubKeyForActiveOrderEvent
} from ".";
import { wsClient, wsClientEmitP } from "../../api/ws";
import { $orders, isMainOrder } from "../orders";
import { Iorder } from "../orders/types";
import {$userWallets} from "../user";

// wsClient.on('sendToPairPubKey', )
// wsClient.on('sendFromPairPubKey', )
wsClient.on('acceptOrder', acceptOrderEvent)
guard({
  source: sample(
    $orders, acceptOrderEvent, (orders, acceptedOrderId) => orders.find(
      ({id}) => id === acceptedOrderId
    ) as Iorder //check undefined in filter
  ),
  filter: (order) => {
    return !!(order && order[isMainOrder])},
  target: setActiveOrderEvent
})

sendPubKeyToOrderFx.use(async (sendInfo) => {
  if(sendInfo) {
    const {isFrom, ...idOrderAndPubkey} = sendInfo;
    return wsClientEmitP(
      sendInfo.isFrom ? 'sendFromPairPubKey' : 'sendToPairPubKey',
      idOrderAndPubkey
    )
  }
  throw new Error('sendInfo === null(check selectPubkeyForActiveOrderAndSendFx)');
})
activeOrderFx.use(async (order) => {
  await wsClientEmitP('acceptOrder', order.id)
  setActiveOrderEvent(order)
})
// forward({
//   from: activeOrderFx.done,
//   to: attach({
//     source: {userWallets: $userWallets},
//     mapParams: () => {},
//     effect: setFromPubKeyForActiveOrderEvent,
//   })
// })

$activeOrder
  .on(setActiveOrderEvent, (_, order) => order)
  .on(
    setToPubKeyForActiveOrderEvent,
    (order, toPubKey) => order ? ({...order, toPubKey}) : null
  )
  .on(
    setFromPubKeyForActiveOrderEvent,
    (order, fromPubKey) => order ? ({...order, fromPubKey}) : null
  )
