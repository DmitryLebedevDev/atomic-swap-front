import React, { FC, memo } from 'react'
import { Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Iorder } from '../../../../models/orders/types'
import './OrderCard.scss'
import {feeForCreateHtlc} from "../../../../common/bitcoin/createHtlcContract";

interface Iprops {
  order: Iorder,
  acceptFn: (order: Iorder) => void
}

export const OrderCard:FC<Iprops> = memo(({
  order,
  acceptFn
}) => {
  const {fromValuePair, fromValue, toValue, toValuePair} = order
  return (
    <Card
      actions={[
        <PlusOutlined onClick={() => acceptFn(order)}/>
      ]}
      hoverable
    >
      <Card.Meta
        className={'order__title'}
        title={`${fromValue} ${fromValuePair} | ${toValue} ${toValuePair}`}
        description={`+${feeForCreateHtlc*2} fee`}
      />
    </Card>
  )
})
