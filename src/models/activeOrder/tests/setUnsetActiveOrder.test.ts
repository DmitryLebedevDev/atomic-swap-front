import {$activeOrder, clearActiveOrderEvent, setActiveOrderEvent} from "../index";
import {Iorder} from "../../orders/types";
import {isMainOrder} from "../../orders";
import '../init'

test('setUnsetActiveOrder', () => {
  const testActiveOrder: Iorder = {
    id: 12,
    fromValuePair: "regnet",
    fromValue: 12,
    fromPubKey: Buffer.from(""),
    toValuePair: "regnet",
    toPubKey: Buffer.from(""),
    toValue: 12,
    [isMainOrder]: true
  }
  setActiveOrderEvent(testActiveOrder);
  expect($activeOrder.getState()).toEqual(testActiveOrder)
  clearActiveOrderEvent()
  expect($activeOrder.getState()).toBeNull()
})