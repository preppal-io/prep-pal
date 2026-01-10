import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'

// Wrapper component that provides all necessary context providers
const AllProviders = ({ children, initialEntries = ['/'] }) => {
  return (
    <MantineProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </MantineProvider>
  )
}

// Custom render function that wraps component with providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
