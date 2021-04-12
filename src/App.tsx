import React, { FC } from 'react';

import { BrowserRouter } from 'react-router-dom'
import { Routes } from './routes'
import './api/ws'
import './models/init'
import 'antd/dist/antd.css'
import './App.css'

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
