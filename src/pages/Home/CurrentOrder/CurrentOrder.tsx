import React, { memo } from 'react'
import { useStore } from 'effector-react'
import { $activeOrder } from '../../../models/activeOrder/index';

export const CurrentOrder = memo(() => {
  const currentOrder = useStore($activeOrder);

  console.log(currentOrder);

  return (
    currentOrder !== null ?
    <div className="currentOrder">
      {currentOrder.fromValue}/{currentOrder.fromValuePair}
      &nbsp;|&nbsp;
      {currentOrder.toValue}/{currentOrder.toValuePair}
    </div>
    :
    <></>
  )
})
