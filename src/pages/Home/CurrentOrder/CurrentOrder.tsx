import React, { memo } from 'react'
import { useStore } from 'effector-react'
import { $activeOrder } from '../../../models/activeOrder/index'

export const CurrentOrder = memo(() => {
  const currentOrder = useStore($activeOrder)

  return (
    currentOrder !== null ?
      <div>
        <div className="currentOrder">
          {currentOrder.fromValue}/{currentOrder.fromValuePair}
          {` `}|{` `}
          {currentOrder.toValue}/{currentOrder.toValuePair}
        </div>
        <div>
          <div>
            from pubkey {currentOrder.fromPubKey?.toString('hex') ?? 'not set'}
          </div>
          <div>
            to pubkey {currentOrder.toPubKey?.toString('hex') ?? 'not set'}
          </div>
        </div>
      </div>
    :
    <></>
  )
})
