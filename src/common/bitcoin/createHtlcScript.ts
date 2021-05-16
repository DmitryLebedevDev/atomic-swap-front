import * as bitcoinjs from 'bitcoinjs-lib'
import {bufferFromHex} from "../functions/bufferFromHex";

const OPS = bitcoinjs.script.OPS;

export enum HtclCodesIndex {
  secretNum = 1,
  acceptor = 4,
  lockTime= 7,
  creator = 10
}

export const createHtlcScript = (
  secretNum: number,
  lockTime: number,
  acceptorPubKey: Buffer,
  creatorPubKey: Buffer
) => {
  return bitcoinjs.script.compile(
    [
      OPS.OP_1, OPS.OP_EQUAL
    ]
    // OPS.OP_SHA256,
    // bitcoinjs.crypto.sha256(
    //   bitcoinjs.script.number.encode(secretNum)
    // ),
    // OPS.OP_EQUAL,
    //OPS.OP_TRUE,
    // OPS.OP_IF,
    //   OPS.OP_TRUE,
    // OPS.OP_ELSE,
    //   OPS.OP_FALSE,
    //   // bitcoinjs.script.number.encode(lockTime),
    //   // OPS.OP_CHECKLOCKTIMEVERIFY,
    //   // OPS.OP_DROP,
    //   // creatorPubKey,
    //   // OPS.OP_CHECKSIG,
    // OPS.OP_ENDIF
  )
}