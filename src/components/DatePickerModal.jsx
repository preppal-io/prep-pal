import React from 'react'
import { Modal, Text, Button, Group, Stack } from '@mantine/core'
import { DatePicker } from '@mantine/dates'

/**
 * Modal component for selecting a date
 */
function DatePickerModal({
  opened,
  onClose,
  title,
  description,
  selectedDate,
  onDateSelect,
  minDate,
  defaultDate,
  cancelLabel
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <Stack spacing="md">
        <Text size="sm" c="dimmed">
          {description}
        </Text>

        <DatePicker
          value={selectedDate}
          onChange={onDateSelect}
          minDate={minDate}
          defaultDate={defaultDate}
          firstDayOfWeek={1}
        />

        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default DatePickerModal
