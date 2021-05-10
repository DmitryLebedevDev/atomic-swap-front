import {createStore} from "effector"
import {IuserWallets} from "./types"
import {initUser} from "./initUser";
import * as bitcoinjs from 'bitcoinjs-lib'
import { bufferToHex } from "../../common/functions/bufferToHex";
import { bufferFromHex } from "../../common/functions/bufferFromHex";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";

export const $userWallets = createStore<IuserWallets>(
  initUser()
)

$userWallets.watch((info) => {
  //timedatectl set-time YYYY-MM-DD HH:MM:SS
  // console.log(info.regnet);
  // const tx = new bitcoinjs.Transaction;
  // tx.addInput(
  //   txIdToHash('e382de964c8a92698e4b939a1fac7dba5c49db00ac3edefe0fa54737ece5c20e'),
  //   0
  // )
  // tx.addOutput(
  //   bitcoinjs.address.toOutputScript(
  //     'msPExa5as7kX2VaDNDsZtetYSvD4qoPir9', bitcoinjs.networks.regtest
  //   ), 49*100000000
  // )
  // tx.addOutput(
  //   bitcoinjs.address.toOutputScript(
  //     'mzqv4ZydSdtKw1QtpGEcR148GgJrYr959o', bitcoinjs.networks.regtest
  //   ), 0.999*100000000
  // )
  // const hash = tx.hashForSignature(
  //   0,
  //   bufferFromHex('76a914d4006df88adf603dabaea11c8ae48cfd36cd08d088ac'),
  //   bitcoinjs.Transaction.SIGHASH_ALL
  // )
  // tx.setInputScript(0, bitcoinjs.script.compile([
  //   bitcoinjs.script.signature.encode(info.regnet.ECPair.sign(hash), bitcoinjs.Transaction.SIGHASH_ALL),
  //   info.regnet.ECPair.publicKey
  // ]))
  // console.log(tx.toHex(), tx.getId());
  // console.log(
  //   bitcoinjs.crypto.ripemd160(
  //     bitcoinjs.crypto.sha256(info.regnet.ECPair.publicKey)
  //   ).toString('hex')
  // )
  // console.log(info.regnet.ECPair.toWIF(), 'wif');
  // console.log(info.regnet.address, info.regnet.ECPair.publicKey.toString('hex'));
})