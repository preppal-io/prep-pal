import React, { useMemo, useState } from 'react'
import { Container, Title, Table, Group } from '@mantine/core'
import InitDatabases from '../components/InitDatabases'
import FilterComponent from '../components/FilterComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import StockCategoryRow from '../components/StockCategoryRow'
import StockItemRow from '../components/StockItemRow'
import { useDebouncedCallback } from '@mantine/hooks'
import { useProductContext } from '../context/ProductContext'
import { updateStockItem, removeStockItem } from '../utils/stockUtils'
import AddStockItemModal from '../components/AddStockItemModal'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'
import ResetDatabases from '../components/ResetDatabases'
import { useGroupedStockItems } from '../hooks/useGroupedStockItems'

import translations from './CurrentScreen.translations'

function CurrentScreen() {
  const { filesExist, productData, loading, saveStockData } = useProductContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryType, setCategoryType] = useState('all')

  const translated = useLittera(translations)

  const { filteredGroupedStockItems } = useGroupedStockItems(
    productData,
    searchFilter,
    categoryType,
    translated
  )

  const handleQuantityChange = async (item, newQuantity) => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.updatingQuantity(item.description),
        id: 'save-stock-item'
      })

      const updatedStock = updateStockItem(productData.stock, item, { quantity: newQuantity })
      const success = await saveStockData(updatedStock)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.quantityUpdated(item.description)
          : translated.quantityNotUpdated(item.description),
        id: 'save-stock-item'
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorUpdatingQuantity(error.message),
        id: 'save-stock-item'
      })
    }
  }

  const debouncedHandleQuantityChange = useDebouncedCallback(handleQuantityChange, 500)

  const handleAddItem = (category) => {
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleDeleteItem = async (item, categoryName) => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.deletingItem(item.description, categoryName),
        id: 'save-stock-item'
      })

      const updatedStock = removeStockItem(productData.stock, item)
      const success = await saveStockData(updatedStock)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.itemDeleted(item.description, categoryName)
          : translated.itemNotDeleted(item.description, categoryName),
        id: 'save-stock-item'
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorDeleting(error.message),
        id: 'save-stock-item'
      })
    }
  }

  const handleUpdateItemDates = async (item, updates) => {
    const updatedStock = updateStockItem(productData.stock, item, updates)
    return await saveStockData(updatedStock)
  }

  // Generate table rows
  const rows = useMemo(() => {
    const tableRows = []

    filteredGroupedStockItems.forEach(group => {
      // Add category row
      tableRows.push(
        <StockCategoryRow
          key={`category-${group.category.id}`}
          group={group}
          onAddItem={handleAddItem}
          translated={translated}
        />
      )

      // Add item rows
      group.items.forEach((item, index) => {
        tableRows.push(
          <StockItemRow
            key={`item-${group.category.id}-${index}`}
            item={item}
            category={group.category}
            onQuantityChange={debouncedHandleQuantityChange}
            onDelete={handleDeleteItem}
            onUpdateDates={(updates) => handleUpdateItemDates(item, updates)}
            translated={translated}
          />
        )
      })
    })

    return tableRows
  }, [filteredGroupedStockItems, translated, debouncedHandleQuantityChange])

  return (
    <Container fluid>
      <Group gap="xs" mb="md" align="flex-start" justify='space-between'>
        <Title order={1}>{translated.title}</Title>
        <ResetDatabases />
      </Group>

      {filesExist.categories ? (
        <>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FilterComponent
                searchValue={searchFilter}
                onSearchChange={setSearchFilter}
                categoryType={categoryType}
                onCategoryTypeChange={setCategoryType}
              />

              <Table withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>{translated.product}</Table.Th>
                    <Table.Th>{translated.quantity}</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </>
          )}

          {selectedCategory && (
            <AddStockItemModal
              opened={modalOpen}
              onClose={() => setModalOpen(false)}
              categoryId={selectedCategory.id}
              categoryName={selectedCategory.productType}
            />
          )}
        </>
      ) : (
        <InitDatabases />
      )}
    </Container>
  )
}

export default CurrentScreen
