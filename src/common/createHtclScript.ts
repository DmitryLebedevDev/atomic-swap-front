import * as bitcoinjs from 'bitcoinjs-lib'

const OPS = bitcoinjs.script.OPS;

export const createHtclScript = (
  secretNum: number,
  lockTime: number,
  acceptorPubKey: Buffer,
  creatorPubKey: Buffer
) => {
  return bitcoinjs.script.compile([
    OPS.OP_SHA256,
    bitcoinjs.crypto.sha256(
      bitcoinjs.script.number.encode(secretNum)
    ),
    OPS.OP_EQUAL,
    OPS.OP_IF,
      acceptorPubKey, OPS.OP_CHECKSIG,
    OPS.OP_ELSE,
      bitcoinjs.script.number.encode(lockTime),
      OPS.OP_CHECKLOCKTIMEVERIFY,
      OPS.OP_DROP,
      creatorPubKey,
      OPS.OP_CHECKSIG,
    OPS.OP_ENDIF
  ])
}