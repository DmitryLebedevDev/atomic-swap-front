import {attach, createEffect, createEvent, createStore} from "effector"
import {IuserNetworkKeys, IuserWallets} from "./types"
import {initUser} from "./initUser";
import * as bitcoinjs from 'bitcoinjs-lib'
import { bufferToHex } from "../../common/functions/bufferToHex";
import { bufferFromHex } from "../../common/functions/bufferFromHex";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";

export const $userWallets = createStore<IuserWallets>(
  initUser()
)

export const updateBalanceEvent = createEvent<{network: IuserNetworkKeys, balance: number}>()

export const updateAllBalanceFx = createEffect<IuserWallets, void>()
export const startUpdateBalanceFx = attach({
  source: $userWallets,
  effect: updateAllBalanceFx
})

$userWallets.watch((info) => {
  //TODO: p2sh test code
  // const tx = new bitcoinjs.Transaction();
  // tx.addInput(
  //   txIdToHash("5e2e3c10aa81e82a37b3c1e054d2731a079f1cf08f9e1e4abf8e634ce8982af9"), 0
  // )
  // tx.addOutput(
  //   bitcoinjs.payments.p2sh({
  //     redeem: {
  //       output: bitcoinjs.script.compile([
  //         bitcoinjs.script.OPS.OP_1,
  //         bitcoinjs.script.OPS.OP_EQUAL
  //       ]),
  //       network: info.regnet.ECPair.network
  //     }
  //   }).output as Buffer,  Math.floor(99.99988000 * 100000000)
  // )
  // const hash = tx.hashForSignature(
  //   0,
  //   bufferFromHex("76a914d4006df88adf603dabaea11c8ae48cfd36cd08d088ac"),
  //   bitcoinjs.Transaction.SIGHASH_ALL
  // )
  // tx.setInputScript(0, bitcoinjs.script.compile([
  //   bitcoinjs.script.signature.encode(
  //     info.regnet.ECPair.sign(hash), bitcoinjs.Transaction.SIGHASH_ALL
  //   ),
  //   info.regnet.ECPair.publicKey
  // ]))
  // console.log(tx.getId())

  // const tx = new bitcoinjs.Transaction()
  // tx.addInput(
  //   txIdToHash("8e2fe24ff6ce91fdb853496a3fff9ce9510b54ff68fcda5610609c9c18842d5a"), 0
  // )
  // tx.addOutput(
  //   bitcoinjs.address.toOutputScript(
  //     "mzqv4ZydSdtKw1QtpGEcR148GgJrYr959o",
  //     bitcoinjs.networks.regtest
  //   ),
  //   Math.floor(99.99978000 * 100000000)
  // )
  // const redeem
  //   = bitcoinjs.script.compile([
  //       bitcoinjs.script.OPS.OP_1,
  //       bitcoinjs.script.OPS.OP_EQUAL
  //     ])
  // const hash = tx.hashForSignature(0, redeem, bitcoinjs.Transaction.SIGHASH_ALL);
  // tx.setInputScript(0, bitcoinjs.payments.p2sh({
  //   redeem: {
  //     input: bitcoinjs.script.compile([
  //       bitcoinjs.script.OPS.OP_1
  //     ]),
  //     output: redeem
  //   }
  // }).input as Buffer)
  //
  // console.log(tx.toHex(), tx.getId())


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