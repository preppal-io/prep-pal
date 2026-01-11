import React from 'react'
import { Table, NumberInput, ActionIcon, Tooltip, Group } from '@mantine/core'
import { Pencil, ShoppingCart, Trash } from '@phosphor-icons/react'

/**
 * Component for rendering a category row in the recommended screen
 */
function CategoryRow({
  item,
  quantity,
  isOverridden,
  onQuantityChange,
  onEdit,
  onDelete,
  onOpenShop,
  translated
}) {
  return (
    <Table.Tr
      onDoubleClick={onEdit}
      style={{ cursor: 'pointer' }}
    >
      <Table.Td>{item.productType}</Table.Td>
      <Table.Td>{item.description}</Table.Td>
      <Table.Td style={{ minWidth: '50px', maxWidth: '80px' }}>
        <NumberInput
          size="xs"
          value={quantity}
          onChange={(value) => onQuantityChange(value, item)}
        />
      </Table.Td>
      <Table.Td c="dimmed">
        {isOverridden ? item.quantity : ""}
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={translated.buyOnline}>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={onOpenShop}
              disabled={!item.onlineShopLink?.length}
            >
              <ShoppingCart size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={translated.edit}>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={onEdit}
            >
              <Pencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={translated.delete(item.productType)}>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDelete(item)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  )
}

export default CategoryRow
