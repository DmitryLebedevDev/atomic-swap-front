import React from 'react';
import {useStore} from "effector-react";
import {$userWallets} from "../../../models/user";
import './UserWalletsInfo.scss';

export const UserWalletsInfo = () => {
  const userWallets = useStore($userWallets);

  return (
    <div className={'userWallets'}>
      {Object.entries(userWallets).map(([nameWallet, walletInfo]) => {
        return (
          <div className={'wallet'} key={nameWallet}>
            {nameWallet}
            {` `}
            {walletInfo.ECPair.publicKey.toString('hex')}
          </div>
        )
      })}
    </div>
  )
}