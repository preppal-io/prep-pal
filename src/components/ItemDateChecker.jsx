import React, { useState, useCallback } from 'react'
import { Tooltip, ActionIcon, useMantineTheme } from '@mantine/core'
import { CalendarCheck, FalloutShelter, UserCheck, CalendarStar } from '@phosphor-icons/react'
import { isTodayAfter, getToday, addDays } from '../utils/dateUtils'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'
import DatePickerModal from './DatePickerModal'
import { useItemActionState, ACTION_STATE } from '../hooks/useItemActionState'

import translations from './ItemDateChecker.translations'

/**
 * Component for checking and updating stock item dates
 * @param {Object} props
 * @param {Object} props.item - The stock item
 * @param {Object} props.category - The category of the item
 * @param {Function} props.onUpdate - Callback to update item: (updates) => Promise<boolean>
 */
const ItemDateChecker = ({ item, category, onUpdate }) => {
  const theme = useMantineTheme()
  const translated = useLittera(translations)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const { actionState, setStateWithTimeout, resetState } = useItemActionState(item)

  // Update the item's checked date and next check date
  const updateItemDates = useCallback(async () => {
    const today = getToday()

    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.updatingCheckedDate(item.description),
        id: 'save-stock-item'
      })

      // Calculate the next check date (today + usualExpiryCheckDays)
      const nextCheckDate = category?.usualExpiryCheckDays
        ? addDays(today, category.usualExpiryCheckDays)
        : item.nextCheck

      const success = await onUpdate({
        checkedDate: today,
        nextCheck: nextCheckDate
      })

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.checkedDateUpdated(item.description)
          : translated.checkedDateNotUpdated(item.description),
        id: 'save-stock-item'
      })

      if (success) {
        resetState()
      }
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorUpdatingCheckedDate(error.message),
        id: 'save-stock-item'
      })
      resetState()
    }
  }, [item, category, onUpdate, translated, resetState])

  // Update the item's next check date
  const updateNextCheckDate = useCallback(async (date) => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.updatingNextCheckDate(item.description),
        id: 'save-stock-item'
      })

      const success = await onUpdate({ nextCheck: date })

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.nextCheckDateUpdated(item.description)
          : translated.nextCheckDateNotUpdated(item.description),
        id: 'save-stock-item'
      })

      if (success) {
        setModalOpen(false)
        resetState()
      }
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorUpdatingNextCheckDate(error.message),
        id: 'save-stock-item'
      })
      setModalOpen(false)
      resetState()
    }
  }, [item, onUpdate, translated, resetState])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedDate(null)
    resetState()
  }, [resetState])

  // Handle clicks based on current state
  const handleClick = useCallback(() => {
    switch (actionState) {
      case ACTION_STATE.USER_CHECK:
        updateItemDates()
        break
      case ACTION_STATE.CALENDAR_STAR:
        setSelectedDate(new Date(item.nextCheck))
        setModalOpen(true)
        break
      default:
        break
    }
  }, [actionState, updateItemDates, item.nextCheck])

  // Determine which icon and tooltip to show based on the current state
  let icon, tooltipLabel, iconColor, onClick

  if (actionState === ACTION_STATE.USER_CHECK) {
    icon = <UserCheck size={24} />
    tooltipLabel = translated.resetCheckedDate
    iconColor = theme.colors.blue[6]
    onClick = handleClick
  } else if (actionState === ACTION_STATE.CALENDAR_STAR) {
    icon = <CalendarStar size={24} />
    tooltipLabel = translated.setupNextCheckDate
    iconColor = theme.colors.blue[6]
    onClick = handleClick
  } else if (isTodayAfter(item.nextCheck)) {
    icon = <FalloutShelter size={24} />
    tooltipLabel = translated.checkStock(item.nextCheck)
    iconColor = theme.colors.yellow[7]
    onClick = () => setStateWithTimeout(ACTION_STATE.USER_CHECK)
  } else {
    icon = <CalendarCheck size={24} />
    tooltipLabel = translated.nextCheck(item.nextCheck)
    iconColor = theme.colors.teal[9]
    onClick = () => setStateWithTimeout(ACTION_STATE.CALENDAR_STAR)
  }

  return (
    <>
      <Tooltip label={tooltipLabel}>
        <ActionIcon
          variant="transparent"
          onClick={onClick}
          tabIndex="-1"
        >
          {React.cloneElement(icon, { color: iconColor })}
        </ActionIcon>
      </Tooltip>

      <DatePickerModal
        opened={modalOpen}
        onClose={handleModalClose}
        title={translated.setNextCheckDate}
        description={translated.selectNextCheckDate(item.description)}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date)
          updateNextCheckDate(date)
        }}
        minDate={new Date()}
        defaultDate={new Date(item.nextCheck)}
        cancelLabel={translated.cancel}
      />
    </>
  )
}

export default ItemDateChecker
