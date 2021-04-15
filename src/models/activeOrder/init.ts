import { guard, sample } from "effector";
import { $activeOrder, acceptOrderEvent, activeOrderFx, setActiveOrderEvent } from ".";
import { wsClient, wsClientEmitP } from "../../api/ws";
import { $orders, isMainOrder } from "../orders";
import { Iorder } from "../orders/types";

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

activeOrderFx.use(async (order) => {
  await wsClientEmitP('acceptOrder', order.id)
  setActiveOrderEvent(order)
})

$activeOrder.on(setActiveOrderEvent, (_, order) => order);