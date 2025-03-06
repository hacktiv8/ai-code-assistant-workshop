import { expect, test } from "vitest"
import { render, screen } from '@testing-library/react'
import App from './App'

test('loads and displays greeting', async () => {
  // ARRANGE
  render(<App />)

  // ACT

  // ASSERT
  const header = screen.getByText("IDEA VAULT")
  expect(header).toBeDefined()
})