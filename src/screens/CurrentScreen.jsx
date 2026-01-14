import React, { useMemo, useState, useCallback } from 'react'
import { Container, Title, Table, Group } from '@mantine/core'
import InitDatabases from '../components/InitDatabases'
import FilterComponent from '../components/FilterComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import StockCategoryRow from '../components/StockCategoryRow'
import StockItemRow from '../components/StockItemRow'
import { useDebouncedCallback } from '@mantine/hooks'
import { useProductContext } from '../context/ProductContext'
import { updateStockItem, removeStockItem } from '../utils/stockUtils'
import { getTodayFormatted, addDays } from '../utils/dateUtils'
import AddStockItemModal from '../components/AddStockItemModal'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'
import ResetDatabases from '../components/ResetDatabases'
import { useGroupedStockItems } from '../hooks/useGroupedStockItems'
import { useScrollPreservation } from '../hooks/useScrollPreservation'

import translations from './CurrentScreen.translations'

function CurrentScreen() {
  const { filesExist, productData, loading, saveStockData } = useProductContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryType, setCategoryType] = useState('all')

  const translated = useLittera(translations)
  const { saveScrollPosition, restoreScrollPosition } = useScrollPreservation()

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
        id: 'save-stock-item',
      })

      const today = getTodayFormatted()
      const updatedStock = updateStockItem(productData.stock, item, {
        quantity: newQuantity,
        checkedDate: today,
      })

      // Save the updated stock
      const success = await saveStockData(updatedStock)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.quantityUpdated(item.description)
          : translated.quantityNotUpdated(item.description),
        id: 'save-stock-item',
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorUpdatingQuantity(error.message),
        id: 'save-stock-item',
      })
    }
  }

  const debouncedHandleQuantityChange = useDebouncedCallback(handleQuantityChange, 500)

  const handleAddItem = useCallback((category) => {
    saveScrollPosition()
    setSelectedCategory(category)
    setModalOpen(true)
  }, [saveScrollPosition])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    restoreScrollPosition()
  }, [restoreScrollPosition])

  const handleDeleteItem = async (item, categoryName) => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.deletingItem(item.description, categoryName),
        id: 'save-stock-item',
      })

      const updatedStock = removeStockItem(productData.stock, item)
      const success = await saveStockData(updatedStock)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.itemDeleted(item.description, categoryName)
          : translated.itemNotDeleted(item.description, categoryName),
        id: 'save-stock-item',
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorDeleting(error.message),
        id: 'save-stock-item',
      })
    }
  }

  const handleUpdateItemDates = async (item, updates) => {
    const updatedStock = updateStockItem(productData.stock, item, updates)
    return await saveStockData(updatedStock)
  }

  const handleGotIt = useCallback(async (category) => {
    try {
      const categoryQuantity = category.quantityOverride || category.quantity
      const categoryName = category.productType

      setSaveStatus({
        saving: true,
        success: null,
        message: translated.gotItFilling(categoryName),
        id: 'save-stock-item',
      })

      // Remove all existing items for this category
      const filteredProducts = productData.stock.products.filter(
        item => item.typeId !== category.id
      )

      // Create new item with recommended quantity
      const checkDays = category.usualExpiryCheckDays || 90
      const newItem = {
        typeId: category.id,
        description: translated.unnamedProduct,
        quantity: categoryQuantity,
        addedDate: getTodayFormatted(),
        checkedDate: getTodayFormatted(),
        nextCheck: addDays(getTodayFormatted(), checkDays)
      }

      const updatedStock = {
        ...productData.stock,
        products: [...filteredProducts, newItem]
      }

      const success = await saveStockData(updatedStock)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.gotItSuccess(categoryName, categoryQuantity)
          : translated.gotItError(categoryName),
        id: 'save-stock-item',
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.gotItError(error.message),
        id: 'save-stock-item',
      })
    }
  }, [productData.stock, saveStockData, translated])

  // Generate table rows
  const rows = useMemo(() => {
    const tableRows = []

    filteredGroupedStockItems.forEach((group) => {
      // Add category row
      tableRows.push(
        <StockCategoryRow
          key={`category-${group.category.id}`}
          group={group}
          onAddItem={handleAddItem}
          onGotIt={handleGotIt}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGroupedStockItems, translated, debouncedHandleQuantityChange, handleGotIt])

  return (
    <Container fluid>
      <Group gap="xs" mb="md" align="flex-start" justify="space-between">
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
              onClose={handleCloseModal}
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
