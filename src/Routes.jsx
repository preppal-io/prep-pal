import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RecommendedScreen from './screens/RecommendedScreen'

function AppRoutes({ routes }) {
  return (
    <Routes>
      <Route index element={<RecommendedScreen />} />
      {routes.map((route) => (
        <Route key={route.id} path={route.link} element={<route.component />} />
      ))}
    </Routes>
  )
}

export default AppRoutes
