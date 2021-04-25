import {createStore} from "effector"
import {IuserWallets} from "./types"
import {generateUserWallets} from "./generateUserWallets"

export const $userWallets = createStore<IuserWallets>(
  generateUserWallets({testnetWif: null, regnetWif: null})
)