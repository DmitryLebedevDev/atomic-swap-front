import { createEffect, createEvent, createStore } from "effector";
import { Iorder } from "../orders/types";

export const setActiveOrderEvent = createEvent<Iorder>();
export const setFromPubKeyForActiveOrderEvent = createEvent<Buffer>();
export const setToPubKeyForActiveOrderEvent = createEvent<Buffer>();
export const acceptOrderEvent = createEvent<number>();

export const activeOrderFx = createEffect<Iorder, void>();
export const sendPubKeyForActiveOrderFx = createEffect<string, void>();
export const sendFromPubKeyForActiveOrderFx = createEffect<string, void>();

export const $activeOrder = createStore<Iorder|null>(null);