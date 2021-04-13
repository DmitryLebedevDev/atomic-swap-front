import { $orders, addOrderEvent, deleteOrderEvent, setOrdersEvent } from ".";
import { wsClient } from "../../api/ws";

wsClient.on('openOrders', setOrdersEvent);
wsClient.on('newOrder', addOrderEvent);
wsClient.on('deleteOrder', deleteOrderEvent);

$orders
  .on(setOrdersEvent, (_, orders) => orders)
  .on(addOrderEvent, (orders, order) => [...orders, order])
  .on(deleteOrderEvent,
    (orders, orderId) => orders.filter(({id}) => id !== orderId)
  )