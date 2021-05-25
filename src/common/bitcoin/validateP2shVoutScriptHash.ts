import {Ivout} from "../../api/types";
import * as bitcoinjs from 'bitcoinjs-lib';

export const validateP2shVoutScriptHash = (
  vout: Ivout | undefined,
  redeem: Buffer
) => {
  const scriptPubKey = vout?.scriptPubKey.asm.split(' ')
  return (
    scriptPubKey &&
    scriptPubKey.length === 3 &&
    scriptPubKey[0] === 'OP_HASH160' &&
    scriptPubKey[1] === bitcoinjs.crypto.hash160(redeem).toString('hex') &&
    scriptPubKey[2] === 'OP_EQUAL'
  )
}