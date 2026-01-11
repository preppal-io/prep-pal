import React from 'react'
import { Table, Tooltip, ActionIcon, Group, Text, NumberInput } from '@mantine/core'
import { Trash } from '@phosphor-icons/react'
import ItemDateChecker from './ItemDateChecker'

/**
 * Component for rendering a stock item row
 */
function StockItemRow({
  item,
  category,
  onQuantityChange,
  onDelete,
  onUpdateDates,
  translated
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs" wrap='nowrap'>
          <ItemDateChecker
            item={item}
            category={category}
            onUpdate={onUpdateDates}
          />
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text>{item.description}</Text>
          <Text size="xs" c="dimmed">(checked: {item.checkedDate})</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <NumberInput
          variant="unstyled"
          size="xs"
          value={item.quantity || 0}
          onChange={(value) => onQuantityChange(item, value)}
          min={0}
          styles={{ input: { width: '80px' } }}
        />
      </Table.Td>
      <Table.Td>
        <Tooltip label={translated.delete(item.description)}>
          <ActionIcon
            variant="transparent"
            onClick={() => onDelete(item, category.productType)}
            color="gray"
            tabIndex="-1"
          >
            <Trash size={20} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  )
}

export default StockItemRow
