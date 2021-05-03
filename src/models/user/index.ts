import {createStore} from "effector"
import {IuserWallets} from "./types"
import {initUser} from "./initUser";
import * as bitcoinjs from 'bitcoinjs-lib'
import { bufferToHex } from "../../common/functions/bufferToHex";
import { bufferFromHex } from "../../common/functions/bufferFromHex";

export const $userWallets = createStore<IuserWallets>(
  initUser()
)

$userWallets.watch((info) => {
  // console.log(
  //   bitcoinjs.crypto.ripemd160(
  //     bitcoinjs.crypto.sha256(info.regnet.ECPair.publicKey)
  //   ).toString('hex')
  // )
  // console.log(info.regnet.ECPair.toWIF(), 'wif');
  // console.log(info.regnet.address, info.regnet.ECPair.publicKey.toString('hex'));
})