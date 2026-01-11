import { useState, useEffect, useCallback } from 'react'
import { NOTIFICATION_TIMEOUT_MS } from '../constants'

/**
 * Action states for item date checker
 */
export const ACTION_STATE = {
  DEFAULT: 'default',
  USER_CHECK: 'userCheck',
  CALENDAR_STAR: 'calendarStar'
}

/**
 * Custom hook to manage action state with auto-reset timeout
 * @param {Object} item - The stock item (used to reset state on item change)
 * @returns {Object} Action state and control functions
 */
export function useItemActionState(item) {
  const [actionState, setActionState] = useState(ACTION_STATE.DEFAULT)

  // Reset action state when item changes
  useEffect(() => {
    setActionState(ACTION_STATE.DEFAULT)
  }, [item.typeId, item.description, item.checkedDate])

  // Set state with auto-reset timeout
  const setStateWithTimeout = useCallback((newState) => {
    setActionState(newState)

    setTimeout(() => {
      setActionState(prevState => {
        // Only revert if still in the same state
        if (prevState === newState) {
          return ACTION_STATE.DEFAULT
        }
        return prevState
      })
    }, NOTIFICATION_TIMEOUT_MS)
  }, [])

  // Reset to default state
  const resetState = useCallback(() => {
    setActionState(ACTION_STATE.DEFAULT)
  }, [])

  return {
    actionState,
    setStateWithTimeout,
    resetState,
    ACTION_STATE
  }
}
