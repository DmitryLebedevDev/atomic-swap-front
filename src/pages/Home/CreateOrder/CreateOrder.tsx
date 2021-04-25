import React, { useRef } from 'react'
import { createOrderFx } from '../../../models/orders'
import './CreateOrder.scss'

export const CreateOrder = () => {
  const fromValueRef = useRef<HTMLInputElement|null>(null)
  const fromValuePairRef = useRef<HTMLSelectElement|null>(null)
  const toValueRef = useRef<HTMLInputElement|null>(null)
  const toValuePairRef = useRef<HTMLSelectElement|null>(null)

  const createOrderFn = () => {
    fromValueRef.current &&
    fromValuePairRef.current &&
    toValueRef.current &&
    toValuePairRef.current &&
    createOrderFx({
      fromValue: +fromValueRef.current.value,
      fromValuePair: fromValuePairRef.current.value as "testnet" | "regnet",
      toValue: +toValueRef.current.value,
      toValuePair: toValuePairRef.current.value as "testnet" | "regnet"
    })
  }

  return (
    <div className="createOrder">
      <div className="createOrderPairs">
        <select ref={fromValuePairRef}>
          <option value="testnet">testnet</option>
          <option value="regnet">regnet</option>
        </select>
        <select ref={toValuePairRef}>
          <option value="regnet">regnet</option>
          <option value="testnet">testnet</option>
        </select>
      </div>
      <div>
        <div>
          values
        </div>
        <input ref={fromValueRef} type="number" defaultValue="0.00001"/>
        <input ref={toValueRef} type="number" defaultValue="0.00001"/>
      </div>
      <div className="createOrderCreateBtn">
        <button onClick={createOrderFn}>create</button>
      </div>
    </div>
  )
}
