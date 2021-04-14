import { $orders, addOrderEvent, createOrderFx, deleteOrderEvent, setOrdersEvent } from ".";
import { wsClient, wsClientEmitP } from "../../api/ws";

wsClient.on('openOrders', setOrdersEvent);
wsClient.on('newOrder', addOrderEvent);
wsClient.on('deleteOrder', deleteOrderEvent);

createOrderFx.use((order) => wsClientEmitP('newOrder', order));

$orders
  .on(setOrdersEvent, (_, orders) => orders)
  .on(addOrderEvent, (orders, order) => [...orders, order])
  .on(deleteOrderEvent,
    (orders, orderId) => orders.filter(({id}) => id !== orderId)
  )