import { createEvent, createStore } from "effector";
import { Iorder } from "./types";

export const $orders = createStore<Iorder[]>([]);
export const deleteOrderEvent = createEvent<number>();
export const setOrdersEvent   = createEvent<Iorder[]>();
export const addOrderEvent    = createEvent<Iorder>();