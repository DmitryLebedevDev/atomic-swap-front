import { createEffect, createEvent, createStore } from "effector";
import { Iorder } from "../orders/types";

export const setActiveOrderEvent = createEvent<Iorder>();

export const activeOrderFx = createEffect<Iorder, void>();

export const $activeOrder = createStore<Iorder|null>(null);