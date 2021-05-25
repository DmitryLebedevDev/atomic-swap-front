import {validateP2shVoutScriptHash} from "./validateP2shVoutScriptHash";
import {Ivout} from "../../api/types";
import * as bitcoinjs from "bitcoinjs-lib";

const correctRedeem = bitcoinjs.script.compile([
  bitcoinjs.script.OPS.OP_TRUE
])
const hash160Redeem = bitcoinjs.crypto.hash160(correctRedeem)

test('validateP2shVoutScriptHash test', () => {
  const testVout: Ivout = {
    n: 0,
    value: 0,
    scriptPubKey: {
      asm: `OP_HASH160 ${hash160Redeem.toString('hex')} OP_EQUAL`,
      hex: ``,
      addresses: [],
      type: "p2sh"
    }
  }
  const testVoutWidthDifferentRedeem: Ivout = {
    n: 0,
    value: 0,
    scriptPubKey: {
      asm: `OP_HASH160 ${hash160Redeem.reverse().toString('hex')} OP_EQUAL`,
      hex: ``,
      addresses: [],
      type: "p2sh"
    }
  }

  expect(validateP2shVoutScriptHash(testVout, correctRedeem)).toBeTruthy()
  expect(validateP2shVoutScriptHash(testVoutWidthDifferentRedeem, correctRedeem)).toBeFalsy()
})