import {createHtlcScript} from "./createHtlcScript";
import {$userWallets} from "../../models/user";
import {dateToUtcDate} from "../functions/dateToUtcDate";
import {validateHtlcScript} from "./validateHtlcScript";
// @ts-ignore
import * as bip65 from 'bip65'

const utcDateNow = dateToUtcDate(new Date());

const htlcSecretNum = 42;
const htlcLockTime = bip65.encode({utc: +utcDateNow / 1000})
const htlc = createHtlcScript(
  htlcSecretNum,
  htlcLockTime,
  $userWallets.getState().regnet.ECPair.publicKey,
  $userWallets.getState().testnet.ECPair.publicKey
);

test('check valid equal htlc contract', () => {
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      htlcLockTime,
      0,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy();
})
test('check validate htlc lockTime', () => {
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000+11}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeFalsy()
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000+9}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy()
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000+10}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy()

  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000-11}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeFalsy()
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000-9}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy()
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      bip65.encode({utc: +utcDateNow/1000-10}),
      10,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy()
})
test('check validate htlc acceptorPubKey', () => {
  expect(
    validateHtlcScript(
      htlc,
      htlcSecretNum,
      htlcLockTime,
      0,
      $userWallets.getState().testnet.ECPair.publicKey
    )
  ).toBeFalsy()
})
test('check optional secretNum', () => {
  expect(
    validateHtlcScript(
      htlc,
      null,
      htlcLockTime,
      0,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeTruthy()
  expect(
    validateHtlcScript(
      htlc,
      1231232132,
      htlcLockTime,
      0,
      $userWallets.getState().regnet.ECPair.publicKey
    )
  ).toBeFalsy()
})
