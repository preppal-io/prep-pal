import React, { useMemo, useState } from 'react'
import { Container, Title, Table, Loader, Tooltip, useMantineTheme, ActionIcon, Group, Text, NumberInput } from '@mantine/core'
import InitDatabases from '../components/InitDatabases'
import { useDebouncedCallback } from '@mantine/hooks'
import { useProductContext } from '../context/ProductContext'
import { Trash, Info, PlusCircle, WarningDiamond } from '@phosphor-icons/react'
import { isTodayAfter } from '../utils/dateUtils'
import ItemDateChecker from '../components/ItemDateChecker'
import AddStockItemModal from '../components/AddStockItemModal'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'
import ResetDatabases from '../components/ResetDatabases'

import translations from './CurrentScreen.translations'

const LOW_STOCK_THRESHOLD = 65
const CRITICAL_STOCK_THRESHOLD_ = 35

function CurrentScreen() {
  const theme = useMantineTheme()
  const { filesExist, productData, loading, saveStockData } = useProductContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const translated = useLittera(translations)
  
  const handleQuantityChange = (item, newQuantity) => {
    try {
      setSaveStatus({ 
        saving: true, 
        success: null, 
        message: translated.updatingQuantity(item.description),
        id: 'save-stock-item'
      })
      
      // Update the item in the products array
      const updatedProducts = productData.stock.products.map(stockItem => {
        if (
          stockItem.typeId === item.typeId && 
          stockItem.description === item.description &&
          stockItem.checkedDate === item.checkedDate
        ) {
          return { ...stockItem, quantity: newQuantity }
        }
        return stockItem
      })
      
      // Create updated stock object
      const updatedStock = {
        ...productData.stock,
        products: updatedProducts
      }
      
      // Save the updated stock
      saveStockData(updatedStock).then(success => {
        setSaveStatus({ 
          saving: false, 
          success: success, 
          message: success 
            ? translated.quantityUpdated(item.description)
            : translated.quantityNotUpdated(item.description),
          id: 'save-stock-item'
        })
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
  
  // Debounced version of handleQuantityChange (500ms delay)
  const debouncedHandleQuantityChange = useDebouncedCallback(handleQuantityChange, 500)
  
  // Group stock items by typeId and include categories with non-zero quantity
  const groupedStockItems = useMemo(() => {
    if (!productData.baseCategories) {
      return []
    }
    
    // Create a map of all categories with non-zero quantity or override
    const grouped = {}
    
    // First, add all categories with non-zero quantity or override
    productData.baseCategories.forEach(category => {
      const quantity = category.quantityOverride || category.quantity
      if (quantity > 0) {
        grouped[category.id] = {
          category,
          items: []
        }
      }
    })
    
    // Then, add stock items to their respective categories
    if (productData.stock && productData.stock.products) {
      productData.stock.products.forEach(item => {
        // If the category doesn't exist yet (could be zero quantity), create it
        if (!grouped[item.typeId]) {
          const category = productData.baseCategories.find(cat => cat.id === item.typeId) || 
                          { productType: translated.unknownCategory, id: item.typeId }
          grouped[item.typeId] = {
            category,
            items: []
          }
        }
        
        // Add the item to its category
        grouped[item.typeId].items.push(item)
      })
    }
    
    // Calculate total quantity for each category
    Object.values(grouped).forEach(group => {
      group.totalQuantity = group.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      
      const categoryQuantity = group.category.quantityOverride || group.category.quantity
      group.stockPercentage = categoryQuantity > 0 
        ? Math.round((group.totalQuantity / categoryQuantity) * 100) 
        : 100

      // add a property telling whether the category has stock expired
      group.hasExpired = group.items.some(item => isTodayAfter(item.nextCheck))
    })
    
    // Convert to array and sort by category id
    return Object.values(grouped).sort((a, b) => a.category.id - b.category.id)
  }, [productData.stock, productData.baseCategories, translated])
  
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
      
      // Filter out the item to delete
      const updatedProducts = productData.stock.products.filter(
        stockItem => !(
          stockItem.typeId === item.typeId && 
          stockItem.description === item.description &&
          stockItem.checkedDate === item.checkedDate
        )
      )
      
      // Create updated stock object
      const updatedStock = {
        ...productData.stock,
        products: updatedProducts
      }
      
      // Save the updated stock
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
  
  // Generate table rows
  const rows = useMemo(() => {
    const tableRows = []
    
    groupedStockItems.forEach(group => {
      const categoryQuantity = group.category.quantityOverride || group.category.quantity
      const hasLowStock = group.stockPercentage < LOW_STOCK_THRESHOLD
      let stockLevelColor = group.stockPercentage > LOW_STOCK_THRESHOLD ? 
        theme.colors.green[6] : 
        group.stockPercentage < CRITICAL_STOCK_THRESHOLD_ ?
          theme.colors.red[6] :
          theme.colors.yellow[6]

      const warningLabel = []
      if (hasLowStock) {
        warningLabel.push(translated.stockLevel(group.stockPercentage, group.totalQuantity, categoryQuantity))
      }

      // if the category has expired items, and the stock level is not critical, show a yellow warning at least
      if (group.hasExpired) {
        warningLabel.push(`${translated.itemsExpired}`)
        
        if (!hasLowStock) {
          stockLevelColor = theme.colors.yellow[6]
        }
      }
      
      // Add category row
      tableRows.push(
        <Table.Tr
          key={`category-${group.category.id}`}
          style={{ borderTop: `1px solid var(--mantine-color-blue-1)`, cursor: 'pointer' }}
          onDoubleClick={() => handleAddItem(group.category)}
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
                onClick={() => handleAddItem(group.category)}
                tabIndex="-1"
              >
                <PlusCircle size={24} />
              </ActionIcon>
            </Tooltip>
          </Table.Td>
        </Table.Tr>
      )
      
      // Add item rows
      group.items.forEach((item, index) => {
        tableRows.push(
          <Table.Tr key={`item-${group.category.id}-${index}`}>
            <Table.Td>
              <Group gap="xs" wrap='nowrap'>
                <ItemDateChecker 
                  item={item}
                  category={group.category}
                  productData={productData}
                  saveStockData={saveStockData}
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
                onChange={(value) => debouncedHandleQuantityChange(item, value)}
                min={0}
                styles={{ input: { width: '80px' } }}
              />
            </Table.Td>
            <Table.Td>
              <Tooltip label={translated.delete(item.description)}>
                <ActionIcon 
                  variant="transparent"
                  onClick={() => handleDeleteItem(item, group.category.productType)}
                  color="gray"
                  tabIndex="-1"
                >
                  <Trash size={20} />
                </ActionIcon>
              </Tooltip>
            </Table.Td>
          </Table.Tr>
        )
      })
    })
    
    return tableRows
  }, [groupedStockItems, theme.colors, translated])

  return (
    <Container fluid>
      <Group gap="xs" mb="md" align="flex-start" justify='space-between'>
        <Title order={1}>{translated.title}</Title>
        <ResetDatabases />
      </Group>
      
      {filesExist.categories ? (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader size="xl" />
            </div>
          ) : (
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
