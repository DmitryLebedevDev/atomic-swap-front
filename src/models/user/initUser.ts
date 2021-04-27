import {IuserWallets} from "./types";
import {generateUserWallets} from "./generateUserWallets";

export const initUser = (): IuserWallets => {
  const testnetWif = localStorage.getItem('testnetWif');
  const regnetWif = localStorage.getItem('regnetWif');

  const userWallets = generateUserWallets({
    testnetWif,
    regnetWif
  })

  !testnetWif && localStorage.setItem('testnetWif', userWallets.testnet.ECPair.toWIF())
  !regnetWif && localStorage.setItem('regnetWif', userWallets.regnet.ECPair.toWIF())

  return userWallets;
}