import { createEffect, createEvent, createStore } from "effector";
import { IcreateOrderDto, Iorder } from "./types";

export const isMainOrder = Symbol('isMainOrder');

export const deleteOrderEvent = createEvent<number>();
export const setOrdersEvent   = createEvent<Iorder[]>();
export const addOrderEvent    = createEvent<Iorder>();

export const createOrderFx = createEffect<IcreateOrderDto, void>();

export const $orders = createStore<Iorder[]>([]);