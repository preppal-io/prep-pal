import React, { useState, useEffect, useCallback } from 'react'
import { 
  Tooltip, 
  ActionIcon, 
  useMantineTheme, 
  Modal, 
  Text, 
  Button, 
  Group, 
  Stack 
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { CalendarCheck, FalloutShelter, UserCheck, CalendarStar } from '@phosphor-icons/react'
import { isTodayAfter, getToday, addDays, formatDate } from '../utils/dateUtils'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'

// Import translations
import translations from './ItemDateChecker.translations'
import { NOTIFICATION_TIMEOUT_MS } from '../constants'

// Constants for item action states
const ACTION_STATE = {
  DEFAULT: 'default',
  USER_CHECK: 'userCheck',
  CALENDAR_STAR: 'calendarStar'
}

const ItemDateChecker = ({ item, category, productData, saveStockData }) => {
  const theme = useMantineTheme()
  const translated = useLittera(translations)
  const [actionState, setActionState] = useState(ACTION_STATE.DEFAULT)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  
  // Reset action state when item changes
  useEffect(() => {
    setActionState(ACTION_STATE.DEFAULT)
  }, [item.typeId, item.description, item.checkedDate])
  
  // Set state with auto-reset timeout
  const setStateWithTimeout = useCallback((newState) => {
    setActionState(newState)
    
    // Set a timeout to revert back to default state if not clicked again
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
  
  // Update the item's checked date and next check date
  const updateItemDates = useCallback(() => {
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
        : item.nextCheck // Keep the existing nextCheck if no usualExpiryCheckDays is defined
      
      // Create updated stock object with the updated item
      const updatedStock = {
        ...productData.stock,
        products: productData.stock.products.map(stockItem => {
          if (
            stockItem.typeId === item.typeId && 
            stockItem.description === item.description &&
            stockItem.checkedDate === item.checkedDate
          ) {
            return { ...stockItem, checkedDate: today, nextCheck: nextCheckDate }
          }
          return stockItem
        })
      }
      
      // Save the updated stock
      saveStockData(updatedStock).then(success => {
        setSaveStatus({ 
          saving: false, 
          success: success, 
          message: success 
            ? translated.checkedDateUpdated(item.description)
            : translated.checkedDateNotUpdated(item.description),
          id: 'save-stock-item'
        })
        
        if (success) {
          setActionState(ACTION_STATE.DEFAULT)
        }
      })
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: translated.errorUpdatingCheckedDate(error.message),
        id: 'save-stock-item'
      })
      setActionState(ACTION_STATE.DEFAULT)
    }
  }, [item, category, productData, saveStockData, translated])
  
  // Update the item's next check date
  const updateNextCheckDate = useCallback((date) => {
    try {
      setSaveStatus({ 
        saving: true, 
        success: null, 
        message: translated.updatingNextCheckDate(item.description),
        id: 'save-stock-item'
      })
      
      // the date format matches by miracle between the date picker component and the way we want to save dates
      const formattedDate = date

      
      // Create updated stock object with the updated item
      const updatedStock = {
        ...productData.stock,
        products: productData.stock.products.map(stockItem => {
          if (
            stockItem.typeId === item.typeId && 
            stockItem.description === item.description &&
            stockItem.checkedDate === item.checkedDate
          ) {
            return { ...stockItem, nextCheck: formattedDate }
          }
          return stockItem
        })
      }
      
      // Save the updated stock
      saveStockData(updatedStock).then(success => {
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
          setActionState(ACTION_STATE.DEFAULT)
        }
      })
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: translated.errorUpdatingNextCheckDate(error.message),
        id: 'save-stock-item'
      })
      setModalOpen(false)
      setActionState(ACTION_STATE.DEFAULT)
    }
  }, [item, productData, saveStockData, translated])
  
  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedDate(null)
    setActionState(ACTION_STATE.DEFAULT)
  }, [])
  
  // Handle clicks based on current state
  const handleClick = useCallback(() => {
    switch (actionState) {
      case ACTION_STATE.USER_CHECK:
        updateItemDates()
        break
      case ACTION_STATE.CALENDAR_STAR:
        // Show the date picker modal
        setSelectedDate(new Date(item.nextCheck))
        setModalOpen(true)
        break
      case ACTION_STATE.DEFAULT:
        // If we're in default state, the click handler depends on which icon was clicked
        // This is handled in the individual icon click handlers
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
  
  // Render the component with the appropriate icon and tooltip
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
      
      {/* Date Picker Modal */}
      <Modal
        opened={modalOpen}
        onClose={handleModalClose}
        title={translated.setNextCheckDate}
        size="sm"
      >
        <Stack spacing="md">
          <Text size="sm" c="dimmed">
            {translated.selectNextCheckDate(item.description)}
          </Text>
          
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date)
              updateNextCheckDate(date)
            }}
            minDate={new Date()} // Can't select dates in the past
            defaultDate={new Date(item.nextCheck)}
            firstDayOfWeek={1} // Monday
          />
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={handleModalClose}>
              {translated.cancel}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default ItemDateChecker
