import React, {useEffect} from 'react';
import {useStore} from "effector-react";
import {$userWallets, startUpdateBalanceFx} from "../../../models/user";
import './UserWalletsInfo.scss';

export const UserWalletsInfo = () => {
  const userWallets = useStore($userWallets);

  useEffect(() => {
    startUpdateBalanceFx()
  }, []);

  return (
    <div className={'userWallets'}>
      {Object.entries(userWallets).map(([nameWallet, walletInfo]) => {
        return (
          <div className={'wallet'} key={nameWallet}>
            <div className={'wallet__name'}>
              {nameWallet}
            </div>
            <div>
              {walletInfo.ECPair.publicKey.toString('hex')}
            </div>
            <div>
              {String(walletInfo.balance)}
            </div>
          </div>
        )
      })}
    </div>
  )
}