import React from 'react'
import { Table, Tooltip, ActionIcon, Group, Text, useMantineTheme } from '@mantine/core'
import { Info, PlusCircle, WarningDiamond } from '@phosphor-icons/react'
import { getStockLevelColor } from '../utils/stockUtils'
import { LOW_STOCK_THRESHOLD } from '../constants'

/**
 * Component for rendering a stock category header row
 */
function StockCategoryRow({ group, onAddItem, translated }) {
  const theme = useMantineTheme()
  const categoryQuantity = group.category.quantityOverride || group.category.quantity
  const hasLowStock = group.stockPercentage < LOW_STOCK_THRESHOLD
  let stockLevelColor = getStockLevelColor(group.stockPercentage, theme)

  const warningLabel = []
  if (hasLowStock) {
    warningLabel.push(translated.stockLevel(group.stockPercentage, group.totalQuantity, categoryQuantity))
  }

  // If the category has expired items, and the stock level is not critical, show a yellow warning
  if (group.hasExpired) {
    warningLabel.push(`${translated.itemsExpired}`)
    if (!hasLowStock) {
      stockLevelColor = theme.colors.yellow[6]
    }
  }

  return (
    <Table.Tr
      style={{ borderTop: `1px solid var(--mantine-color-blue-1)`, cursor: 'pointer' }}
      onDoubleClick={() => onAddItem(group.category)}
    >
      <Table.Td>
        <Group gap="xs" wrap='nowrap'>
          {(hasLowStock || group.hasExpired) && (
            <Tooltip multiline label={warningLabel.join(' | ')}>
              <WarningDiamond size={24} color={stockLevelColor} weight="fill" />
            </Tooltip>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text fw={700} c="blue.4">{group.category.productType}</Text>
          {group.category.usualExpiryCheckDays && (
            <Tooltip label={translated.averageExpiration(group.category.usualExpiryCheckDays)}>
              <Info color={theme.colors.blue[9]} size={18} />
            </Tooltip>
          )}
        </Group>
        <Text c="dimmed" size='xs'>{group.category.description}</Text>
      </Table.Td>
      <Table.Td>{categoryQuantity}</Table.Td>
      <Table.Td>
        <Tooltip label={translated.addItem(group.category.productType)}>
          <ActionIcon
            variant="transparent"
            onClick={() => onAddItem(group.category)}
            tabIndex="-1"
          >
            <PlusCircle size={24} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  )
}

export default StockCategoryRow
