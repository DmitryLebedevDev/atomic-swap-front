import React, { FC } from 'react'
import { Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { Iorder } from '../../../models/orders/types';

export const OrderCard:FC<Iorder> = ({fromValuePair, toValuePair}) => {
  return (
    <Card
      actions={[
        <PlusOutlined />
      ]}
      hoverable
    >
      <Card.Meta
        title={`${fromValuePair}/${toValuePair}`}
      />
    </Card>
  )
}
