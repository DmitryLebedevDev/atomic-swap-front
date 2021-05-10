import {ECPairInterface} from "bitcoinjs-lib";
import {getUnspentTransactionsReq} from "../../api/rest";
import {IuserNetworkKeys} from "../../models/user/types";
import * as bitcoinjs from 'bitcoinjs-lib'
import {txIdToHash} from "./txIdToHash";
import {bitcoinToSat} from "./bitcoinToSat";
import {createHtlcScript} from "./createHtlcScript";
import {bufferFromHex} from "../functions/bufferFromHex";

export const createHtlcContract = async (
  network: IuserNetworkKeys,
  ECPair: ECPairInterface,
  acceptorPubKey: Buffer,
  value: number,
  secretNum: number,
  lockTime: number,
) => {
  const creatorAddress: string = bitcoinjs.payments.p2pkh({
    pubkey: ECPair.publicKey,
    network: ECPair.network
  }).address as string
  const listUnspent = await getUnspentTransactionsReq(
    network,
    creatorAddress
  )
  console.log(listUnspent)
  const allUnsprent = listUnspent.reduce(
    (sum, {value}) => sum + value, 0
  )
  const tx = new bitcoinjs.Transaction();
  listUnspent.forEach(({txid, n}) => {
    tx.addInput(txIdToHash(txid), n)
  })
  tx.addOutput(
    createHtlcScript(
      secretNum,
      lockTime,
      acceptorPubKey,
      ECPair.publicKey
    ),
    bitcoinToSat(value)
  )
  tx.addOutput(
    bitcoinjs.address.toOutputScript(creatorAddress, ECPair.network),
    bitcoinToSat(allUnsprent - value - 0.00001)
  )
  listUnspent.forEach(({script_pub_key: {hex}}, index) => {
    const hash = tx.hashForSignature(
      index, bufferFromHex(hex), bitcoinjs.Transaction.SIGHASH_ALL
    )
    tx.setInputScript(index, bitcoinjs.script.compile([
      bitcoinjs.script.signature.encode(
        ECPair.sign(hash), bitcoinjs.Transaction.SIGHASH_ALL
      ),
      ECPair.publicKey
    ]))
  })
  return tx.toHex()
}