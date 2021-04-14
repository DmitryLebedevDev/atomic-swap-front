import { $activeOrder, activeOrderFx, setActiveOrderEvent } from ".";
import { wsClient, wsClientEmitP } from "../../api/ws";

activeOrderFx.use((order) => {
  wsClientEmitP('acceptOrder', order.id)
  setActiveOrderEvent(order)
})

$activeOrder.on(setActiveOrderEvent, (_, order) => order);
$activeOrder.watch(console.log);