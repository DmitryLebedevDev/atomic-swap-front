import {IuserWallets, Iwallet} from "./types"
import * as bitcoinjs from 'bitcoinjs-lib'
import {Network} from "bitcoinjs-lib"

const createWallet = (network: Network, wif: string | null): Iwallet => {
  const ECPair = wif ?
    bitcoinjs.ECPair.fromWIF(wif, network) :
    bitcoinjs.ECPair.makeRandom({
      network
    })
  const {address} = bitcoinjs.payments.p2pkh(
    {pubkey: ECPair.publicKey, network}
  )
  return {
    ECPair,
    address: address as string,
    balance: NaN
  }
}

export const generateUserWallets = ({
  testnetWif,
  regnetWif
}: {
  testnetWif: string | null,
  regnetWif: string | null
}): IuserWallets => ({
  regnet: createWallet(bitcoinjs.networks.testnet, regnetWif),
  testnet: createWallet(bitcoinjs.networks.regtest, testnetWif)
})
