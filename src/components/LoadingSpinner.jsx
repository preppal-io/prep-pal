import React from 'react'
import { Loader } from '@mantine/core'

/**
 * Centered loading spinner component
 */
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <Loader size="xl" />
    </div>
  )
}

export default LoadingSpinner
