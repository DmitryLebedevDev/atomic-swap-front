import {
  $activeOrder,
  activeOrderFx,
  onActiveOrderFx,
  onSendFromPairPubKey,
  onSendToPairPubKey, sendHtlcToOrderFx,
  sendPubKeyToOrderFx,
  setActiveOrderEvent,
  setFromPubKeyForActiveOrderEvent,
  setToPubKeyForActiveOrderEvent,
  startAcceptedOrderFx
} from ".";
import { wsClient, wsClientEmitP, wsClientOnP } from "../../api/ws";
import { isMainOrder } from "../orders"
import { Iorder } from "../orders/types"
import { bufferFromHex } from "../../common/functions/bufferFromHex"
import {$userWallets} from "../user";
import * as bitcoinjs from 'bitcoinjs-lib';
import {createHtlcScript, HtclCodesIndex} from "../../common/bitcoin/createHtlcScript";
import {txIdToHash} from "../../common/bitcoin/txIdToHash";
import { createEffect } from "effector/effector.cjs";
import {IemitHtlcToOrder, IemitPubKeyToOrder} from "./types";
import {createHtlcContract, feeForCreateHtlc} from "../../common/bitcoin/createHtlcContract";
import {dateToUtcDate} from "../../common/functions/dateToUtcDate";
// @ts-ignore
import * as bip65 from 'bip65'
import {getTransactionReq, sendTransactionReq} from "../../api/rest";
import {validateP2shVoutScriptHash} from "../../common/bitcoin/validateP2shVoutScriptHash";
import {validateHtlcScript} from "../../common/bitcoin/validateHtlcScript";
import {pendingConfirmsTransaction} from "../../common/bitcoin/pendingConfirmsTransaction";

wsClient.on('sendToPairPubKey', onSendToPairPubKey)
wsClient.on('sendFromPairPubKey', onSendFromPairPubKey)

sendPubKeyToOrderFx.use(async (sendInfo) => {
  const {keyType, ...idOrderAndPubkey} = sendInfo
  return wsClientEmitP(
    keyType === 'from' ? 'sendFromPairPubKey' : 'sendToPairPubKey',
    idOrderAndPubkey
  )
})
sendHtlcToOrderFx.use(async (sendInfo) => {
  const {htlcType, ...htlcInfo} = sendInfo;
  return wsClientEmitP(
    htlcType === 'from' ? 'sendFromPairHTLC' : 'sendToPairHTLC',
    htlcInfo
  )
})

wsClient.on('acceptOrder', onActiveOrderFx)
startAcceptedOrderFx.use(
  async ({acceptedOrderId, orders, userWallets}) => {
    const acceptedOrder = orders.find(
      (order) => order.id === acceptedOrderId && order[isMainOrder]
    )
    if(!acceptedOrder) {throw new Error('not find main order')}

    const fromPubKey
      = userWallets[acceptedOrder.toValuePair]
          .ECPair
          .publicKey
    const toPubKey
      = await wsClientOnP(
        'sendToPairPubKey',
        ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
          return bufferFromHex(hexPubKey);
        }
      )

    setActiveOrderEvent({
      ...acceptedOrder,
      fromPubKey
    });
    setToPubKeyForActiveOrderEvent({pubKey: toPubKey});

    await sendPubKeyToOrderFx({
      id: acceptedOrder.id,
      hexPubKey: fromPubKey.toString('hex'),
      keyType: 'from'
    })

    const {txid, redeem}
      = await wsClientOnP(
        'sendFromPairHTLC',
      (htlcForFromInfo: Omit<IemitHtlcToOrder, 'htlcType'>) => {
        console.log(htlcForFromInfo)
        return {
          ...htlcForFromInfo,
          redeem: bufferFromHex(htlcForFromInfo.redeem)
        }
      })

    const transaction
      = await getTransactionReq(acceptedOrder.fromValuePair, txid)
    if(
      ( transaction.vout[0].value -
        (acceptedOrder.fromValue + feeForCreateHtlc) < 0.000000001
      ) &&
      !validateP2shVoutScriptHash(transaction?.vout[0], redeem) &&
      !validateHtlcScript(
        redeem,
        null,
        bip65({
          utc: (+dateToUtcDate(new Date())+(60*120))/1000^0
        }),
        5,
        fromPubKey
      )
    ) {
      throw new Error('incorrect from htlc')
    }
    console.log('from ok htlc')
    await pendingConfirmsTransaction(
      acceptedOrder.fromValuePair,
      transaction.txid,
      6
    );
    console.log('from htlc transaction confirmed');
    const redeemFromDecompile = bitcoinjs.script.decompile(redeem) as (number | Buffer)[]
    const dateNowUtcSec = +dateToUtcDate(new Date()) / 1000 ^ 0
    const htlcFormTo = await createHtlcContract(
      acceptedOrder.fromValuePair,
      userWallets[acceptedOrder.fromValuePair].ECPair,
      toPubKey,
      acceptedOrder.fromValue + feeForCreateHtlc,
      redeemFromDecompile[HtclCodesIndex.secretNum] as Buffer,
      bip65({utc: dateNowUtcSec+60*60}),
    )
    const pushTransactionInfo = await sendTransactionReq(acceptedOrder.fromValuePair, htlcFormTo.hex)
    console.log(pushTransactionInfo, 'sendToHtlc');
  }
)

activeOrderFx.use(async ({order, userWallets}) => {
  await wsClientEmitP('acceptOrder', order.id)

  const toPubKey
    = userWallets[order.fromValuePair]
      .ECPair
      .publicKey;
  order.toPubKey = toPubKey;
  setActiveOrderEvent({...order});

  await sendPubKeyToOrderFx({
    id: order.id,
    hexPubKey: toPubKey.toString('hex'),
    keyType: 'to'
  })

  const fromPubKey
    = await wsClientOnP(
      'sendFromPairPubKey',
      ({hexPubKey}: Omit<IemitPubKeyToOrder, 'keyType'>) => {
        return bufferFromHex(hexPubKey);
      }
    )
  order.fromPubKey = fromPubKey;
  setFromPubKeyForActiveOrderEvent({pubKey: fromPubKey});

  const dateNowUtcSec = +dateToUtcDate(new Date()) / 1000 ^ 0
  const secretNum = window.crypto.getRandomValues(new Uint32Array(1))[0];

  const htlcForFrom
    = await createHtlcContract(
    order.toValuePair,
    userWallets[order.toValuePair].ECPair,
    fromPubKey,
    order.toValue + feeForCreateHtlc,
    secretNum,
    bip65.encode({utc: dateNowUtcSec+60*120})
  )
  console.log(htlcForFrom)
  const pushTransactionInfo
    = await sendTransactionReq(
      order.toValuePair,
      htlcForFrom.hex
    )

  if(!pushTransactionInfo.success) {throw new Error(pushTransactionInfo.message)}
  await sendHtlcToOrderFx({
    id: order.id,
    txid: pushTransactionInfo.txid,
    redeem: htlcForFrom.redeem.toString('hex'),
    htlcType: 'from'
  })
})
startAcceptedOrderFx.failData.watch((data) => console.log(data));

$activeOrder
  .on(setActiveOrderEvent, (_, order) => order)
  .on(
    setToPubKeyForActiveOrderEvent,
    (order, {pubKey: toPubKey}) => order ? ({...order, toPubKey}) : null
  )
  .on(
    setFromPubKeyForActiveOrderEvent,
    (order, {pubKey: fromPubKey}) => order ? ({...order, fromPubKey}) : null
  )
