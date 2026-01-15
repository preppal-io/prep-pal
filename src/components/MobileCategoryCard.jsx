import React from 'react'
import { Card, Group, Text, NumberInput, Menu, ActionIcon, Stack, Box } from '@mantine/core'
import { DotsThreeVertical, Pencil, ShoppingCart, Trash } from '@phosphor-icons/react'

/**
 * Mobile-friendly card component for displaying a category on smartphone screens
 */
function MobileCategoryCard({
  item,
  quantity,
  isOverridden,
  onQuantityChange,
  onEdit,
  onDelete,
  onOpenShop,
  translated,
  CategoryIcon
}) {
  return (
    <Card shadow="xs" padding="sm" radius="md" withBorder mb="xs">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Box style={{ flex: 1, minWidth: 0 }} onClick={onEdit}>
          <Group gap="xs" wrap="nowrap">
            {CategoryIcon && <CategoryIcon size={16} style={{ flexShrink: 0 }} />}
            <Text fw={500} truncate="end">{item.productType}</Text>
          </Group>
          <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
            {item.description}
          </Text>
        </Box>

        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Stack gap={2} align="center">
            <NumberInput
              size="xs"
              value={quantity}
              onChange={(value) => onQuantityChange(value, item)}
              style={{ width: 70 }}
            />
            {isOverridden && (
              <Text size="xs" c="dimmed">({item.quantity})</Text>
            )}
          </Stack>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg">
                <DotsThreeVertical size={20} weight="bold" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<ShoppingCart size={16} />}
                onClick={onOpenShop}
                disabled={!item.onlineShopLink?.length}
              >
                {translated.buyOnline}
              </Menu.Item>
              <Menu.Item
                leftSection={<Pencil size={16} />}
                onClick={onEdit}
              >
                {translated.edit}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<Trash size={16} />}
                onClick={() => onDelete(item)}
              >
                {translated.delete(item.productType)}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Card>
  )
}

export default MobileCategoryCard
