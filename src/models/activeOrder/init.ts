import { $activeOrder, activeOrderFx } from ".";
import { wsClientEmitP } from "../../api/ws";

activeOrderFx.use((orderId) => wsClientEmitP('acceptOrder', orderId))

$activeOrder.on(activeOrderFx.doneData, (_, order) => order);