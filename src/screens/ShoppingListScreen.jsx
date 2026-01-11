import React, { useState, useEffect } from 'react'
import { Container, Table, Title, Alert, Text, Button, UnstyledButton, Tooltip } from '@mantine/core'
import InitDatabases from '../components/InitDatabases'
import LoadingSpinner from '../components/LoadingSpinner'
import { Square, StackPlus, Tag, Hash, Printer, Eye, EyeClosed } from '@phosphor-icons/react'
import { useProductContext } from '../context/ProductContext'
import classes from './ShoppingListScreen.module.css'
import { useLittera } from '@assembless/react-littera'

const translations = {
  title: {
    fr_CH: "Liste de courses",
    de_CH: "Einkaufsliste",
    en_US: "Shopping list"
  },
  print: {
    fr_CH: "Imprimer",
    de_CH: "Drucken",
    en_US: "Print"
  },
  errorLoadingData: {
    fr_CH: "Erreur lors du chargement des données",
    de_CH: "Fehler beim Laden der Daten",
    en_US: "Error loading data"
  },
  category: {
    fr_CH: "Catégorie",
    de_CH: "Kategorie",
    en_US: "Category"
  },
  unit: {
    fr_CH: "Unité",
    de_CH: "Einheit",
    en_US: "Unit"
  },
  description: {
    fr_CH: "Description",
    de_CH: "Beschreibung",
    en_US: "Description"
  },
  includeWhenPrinting: {
    fr_CH: "Inclure lors de l'impression",
    de_CH: "Beim Drucken einfügen",
    en_US: "Include when printing"
  }
}

function ShoppingListScreen() {
  const { productData, loading, error, filesExist } = useProductContext()
  const [shoppingListData, setShoppingListData] = useState([])
  const [hiddenItems, setHiddenItems] = useState({})

  const translated = useLittera(translations)

  // Calculate shopping list data when productData changes
  useEffect(() => {
    if (productData && productData.baseCategories && productData.stock) {
      // Create a map to store the sum of quantities for each category
      const categoryQuantities = {}
      
      // Initialize with all categories having 0 current quantity
      productData.baseCategories.forEach(category => {
        categoryQuantities[category.id] = 0
      })
      
      // Sum up quantities from stock items
      if (productData.stock.products) {
        productData.stock.products.forEach(stockItem => {
          if (categoryQuantities[stockItem.typeId] !== undefined) {
            categoryQuantities[stockItem.typeId] += stockItem.quantity
          }
        })
      }
      
      // Calculate shopping list with differences
      const shoppingList = productData.baseCategories.map(category => {
        const currentQuantity = categoryQuantities[category.id] || 0
        const desiredQuantity = category.quantityOverride || category.quantity
        const quantityToBuy = Math.max(0, desiredQuantity - currentQuantity)
        
        return {
          ...category,
          currentQuantity,
          quantityToBuy,
        }
      }).filter(item => item.quantityToBuy > 0)
      
      setShoppingListData(shoppingList)
    }
  }, [productData])

  const toggleItemVisibility = (itemId) => {
    setHiddenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const rows = shoppingListData.map((item) => {
    const isHidden = hiddenItems[item.id]
    
    return (
      <Table.Tr 
        key={item.id} 
        className={isHidden ? classes.hiddenRow : ''}
      >
        <Table.Td>
          <Tooltip label={translated.includeWhenPrinting}>
            <UnstyledButton onClick={() => toggleItemVisibility(item.id)}>
              {isHidden ? <EyeClosed size="24" /> : <Eye size="24" />}
            </UnstyledButton>
          </Tooltip>
        </Table.Td>
        <Table.Td><Square size="24" /></Table.Td>
        <Table.Td><strong>{item.quantityToBuy}</strong></Table.Td>
        <Table.Td>{item.productType}</Table.Td>
        <Table.Td c="dimmed">{item.defaultUnit}</Table.Td>
        <Table.Td c="dimmed">{item.description}</Table.Td>
      </Table.Tr>
    )
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <Container fluid>
      <div className={classes.headerContainer}>
        <div>
          <Title order={1} mb="md">{translated.title}</Title>
          <Text c="dimmed" mb="md">{
            new Date().toLocaleDateString('fr-CH')
          }</Text>
        </div>
        <Button 
          leftSection={<Printer size={20} />}
          onClick={handlePrint}
          className={classes.printButton}
        >
          {translated.print}
        </Button>
      </div>
      
      {/* Show error message if there's an error */}
      {error && (
        <Alert color="red" title={translated.errorLoadingData} mb="md">
          {error}
        </Alert>
      )}
      
      {/* Check if databases exist */}
      {!filesExist.categories ? (
        <InitDatabases />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <Table withRowBorders={false} className={classes.shoppingListTable}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th><Printer size="18" weight='fill' /></Table.Th>
              <Table.Th></Table.Th>
              <Table.Th><StackPlus size="18" weight='fill' /></Table.Th>
              <Table.Th><Tag size="18" weight='fill' /> {translated.category}</Table.Th>
              <Table.Th c="dimmed"><Hash size="18" /> {translated.unit}</Table.Th>
              <Table.Th c="dimmed">{translated.description}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Container>
  )
}

export default ShoppingListScreen
