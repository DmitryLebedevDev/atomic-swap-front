import { $orders, addOrderEvent, createOrderFx, deleteOrderEvent, isMainOrder, setOrdersEvent } from "."
import { wsClient, wsClientEmitP } from "../../api/ws"

wsClient.on('openOrders', setOrdersEvent)
wsClient.on('newOrder', addOrderEvent)
wsClient.on('deleteOrder', deleteOrderEvent)

createOrderFx.use(async (order) => {
  const id = await wsClientEmitP('newOrder', order)
  addOrderEvent({
    id,
    ...order,
    [isMainOrder]: true
  })
})

$orders
  .on(setOrdersEvent, (_, orders) => orders)
  .on(addOrderEvent, (orders, order) => [...orders, order])
  .on(deleteOrderEvent,
    (orders, orderId) => orders.filter(({id}) => id !== orderId)
  )