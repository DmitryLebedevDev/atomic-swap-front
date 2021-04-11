import { $orders, addOrderEvent, setOrdersEvent } from ".";
import { wsClient } from "../../api/ws";

wsClient.on('activeOrders', setOrdersEvent);

$orders
  .on(setOrdersEvent, (_, orders) => orders)
  .on(addOrderEvent, (orders, order) => [...orders, order])