import React, { memo } from 'react'
import { useStore } from 'effector-react'
import { $orders } from '../../../models/orders'
import { OrderCard } from './Order/OrderCard'
import { activeOrderFx } from '../../../models/activeOrder'
import './ActiveOrdersList.scss'

export const ActiveOrdersList = memo(() => {
  const activeOrders = useStore($orders)

  return (
    <div className="ordersList">{
      activeOrders.map(order => (
        <OrderCard order={order} acceptFn={activeOrderFx} key={order.id}/>)
      )
    }</div>
  )
})

