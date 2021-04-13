import { createEffect, createStore } from "effector";
import { Iorder } from "../orders/types";

export const activeOrderFx = createEffect<number, Iorder>();
export const $activeOrder = createStore<Iorder|null>(null);