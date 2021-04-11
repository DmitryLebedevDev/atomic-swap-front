import React, { memo } from 'react'
import { useStore } from 'effector-react'
import { $orders } from '../../../models/orders'

export const ActiveOrdersTable = memo(() => {
  const activeOrders = useStore($orders)

  return (
    <div>
      {activeOrders.map(
        ({id, fromValue, fromValuePair, toValue, toValuePair}) => <div key={id}>
          {`${fromValuePair}/${toValuePair}`}
        </div>)
      }
    </div>
  )
})

