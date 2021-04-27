import {createStore} from "effector"
import {IuserWallets} from "./types"
import {initUser} from "./initUser";

export const $userWallets = createStore<IuserWallets>(
  initUser()
)