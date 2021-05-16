import React, { FC } from 'react'

import { BrowserRouter } from 'react-router-dom'
import { Routes } from './routes'
import './api/ws'
import './models/init'
import 'antd/dist/antd.css'
import './App.css'
import {bitcoinToSat} from "./common/bitcoin/bitcoinToSat";

(window as any).bitcoinToSat = bitcoinToSat

function App() {
  return (
    <Routes/>
  )
}

export const AppWidthHocs:FC = () => {
  return <BrowserRouter>
    <App/>
  </BrowserRouter>
}

export default AppWidthHocs
