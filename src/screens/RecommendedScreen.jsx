import React, { useState, useEffect, useMemo } from 'react'
import { Container, NumberInput, Table, Title, Text, Group, Alert, ActionIcon, Tooltip, Button } from '@mantine/core'
import { Pencil, ShoppingCart, Trash, Plus } from '@phosphor-icons/react'
import EditCategoryModal from '../components/EditCategoryModal'
import AddCategoryModal from '../components/AddCategoryModal'
import InitDatabases from '../components/InitDatabases'
import FilterComponent from '../components/FilterComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import { useProductContext } from '../context/ProductContext'
import { useDebouncedCallback } from '@mantine/hooks'
import { setSaveStatus } from '../utils/notificationUtils'
import { openInBrowser } from '../utils/browserUtils'
import { useLittera } from '@assembless/react-littera'
import ResetDatabases from '../components/ResetDatabases'

const translations = {
  title: {
    fr_CH: "Catégories recommandées",
    de_CH: "Empfohlene Kategorien",
    en_US: "Recommended categories"
  },
  addCategory: {
    fr_CH: "Ajouter une catégorie",
    de_CH: "Kategorie hinzufügen",
    en_US: "Add category"
  },
  saveStatus: {
    fr_CH: "Enregistrement des modifications...",
    de_CH: "Änderungen speichern...",
    en_US: "Saving changes..."
  },
  saveSuccess: {
    fr_CH: "Modifications enregistrées avec succès",
    de_CH: "Änderungen erfolgreich gespeichert",
    en_US: "Changes saved successfully"
  },
  saveError: {
    fr_CH: "Erreur lors de l'enregistrement des modifications",
    de_CH: "Fehler beim Speichern der Änderungen",
    en_US: "Error saving changes"
  },
  errorSavingFile: {
    fr_CH: "Erreur lors de la sauvegarde du fichier",
    de_CH: "Fehler beim Speichern der Datei",
    en_US: "Error saving file"
  },
  lastUpdated: {
    fr_CH: "Dernière mise à jour :",
    de_CH: "Letzte Aktualisierung:",
    en_US: "Last updated:"
  },
  productType: {
    fr_CH: "Type de produit",
    de_CH: "Produktart",
    en_US: "Product type"
  },
  description: {
    fr_CH: "Description",
    de_CH: "Beschreibung",
    en_US: "Description"
  },
  quantity: {
    fr_CH: "Quantité",
    de_CH: "Menge",
    en_US: "Quantity"
  },
  override: {
    fr_CH: "Ajuster",
    de_CH: "Überschreiben",
    en_US: "Override"
  },
  buyOnline: {
    fr_CH: "Acheter en ligne",
    de_CH: "Online kaufen",
    en_US: "Buy online"
  },
  edit: {
    fr_CH: "Modifier",
    de_CH: "Bearbeiten",
    en_US: "Edit"
  },
  delete: (categoryName) => ({
    fr_CH: `Supprimer ${categoryName}`,
    de_CH: `Löschen ${categoryName}`,
    en_US: `Delete ${categoryName}`
  }),
  deletingCategory: (categoryName) => ({
    fr_CH: `Suppression de la catégorie ${categoryName}...`,
    de_CH: `Löschen der Kategorie ${categoryName}...`,
    en_US: `Deleting ${categoryName} category...`
  }),
  categoryDeleted: (categoryName) => ({
    fr_CH: `Catégorie ${categoryName} supprimée avec succès`,
    de_CH: `Kategorie ${categoryName} erfolgreich gelöscht`,
    en_US: `${categoryName} category successfully deleted`
  }),
  categoryNotDeleted: (categoryName) => ({
    fr_CH: `Échec de la suppression de la catégorie ${categoryName}`,
    de_CH: `Fehler beim Löschen der Kategorie ${categoryName}`,
    en_US: `Failed to delete ${categoryName} category`
  }),
  errorDeletingCategory: (errorMessage) => ({
    fr_CH: `Erreur lors de la suppression de la catégorie : ${errorMessage}`,
    de_CH: `Fehler beim Löschen der Kategorie: ${errorMessage}`,
    en_US: `Error deleting category: ${errorMessage}`
  })
}

function RecommendedScreen() {
  const { filesExist, productData, loading, error, updateCategory, deleteCategory } = useProductContext()
  const [data, setData] = useState([])
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryType, setCategoryType] = useState('all')

  const translated = useLittera(translations)

  // Update local state when productData changes
  useEffect(() => {
    if (productData && productData.baseCategories) {
      setData(productData.baseCategories)
    }
  }, [productData])

  // Update local state immediately without debounce
  const updateLocalState = (value, item) => {
    const updatedData = data.map(cat =>
      cat.id === item.id ? { ...cat, quantityOverride: value } : cat
    )
    setData(updatedData)
  }
  
  // Handle quantity override change with debounce for saving to disk
  const saveChanges = async (value, item) => {
    try {
      setSaveStatus({ saving: true, success: null, message: translated.saveStatus, id: 'save-status' })

      const success = await updateCategory(item.id, { quantityOverride: value })
      setSaveStatus({
        saving: false,
        success: success,
        message: success ? translated.saveSuccess : translated.saveError,
        id: 'save-status'
      })
    } catch (err) {
      setSaveStatus({ saving: false, success: false, message: translated.saveError, id: 'save-status' })
    }
  }

  // Debounced version of saveChanges (500ms delay)
  const debouncedSaveChanges = useDebouncedCallback(saveChanges, 500)

  // Combined function to update state immediately and save with debounce
  const handleQuantityChange = (value, item) => {
    // Update local state immediately
    updateLocalState(value, item)

    // Save to disk with debounce
    debouncedSaveChanges(value, item)
  }

  const quantity = (item) => {
    if (item.quantityOverride || item.quantityOverride === 0) {
      return item.quantityOverride
    }
    return item.quantity
  }

  const overridenQuantity = (item) => {
    return (item.quantityOverride || item.quantityOverride === 0) && item.quantityOverride !== item.quantity
  }

  const handleDeleteCategory = async (category) => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.deletingCategory(category.productType),
        id: 'save-category'
      })

      const success = await deleteCategory(category.id)

      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.categoryDeleted(category.productType)
          : translated.categoryNotDeleted(category.productType),
        id: 'save-category'
      })
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorDeletingCategory(error.message),
        id: 'save-category'
      })
    }
  }

  // Filter categories by search text and category type
  const filteredData = useMemo(() => {
    let result = data

    // Filter by search text
    if (searchFilter.trim()) {
      result = result.filter(cat =>
        cat.productType.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }

    // Filter by category type (if not 'all')
    // Categories without categoryType are shown in all filter views for backward compatibility
    if (categoryType !== 'all') {
      result = result.filter(cat => cat.categoryType === categoryType)
    }

    return result
  }, [data, searchFilter, categoryType])

  const rows = filteredData.map((item) => (
    <Table.Tr
      key={item.productType}
      onDoubleClick={() => {
        setSelectedCategory(item)
        setEditModalOpened(true)
      }}
      style={{ cursor: 'pointer' }}
    >
      <Table.Td>{item.productType}</Table.Td>
      <Table.Td>{item.description}</Table.Td>
      <Table.Td style={{ minWidth: '50px', maxWidth: '80px' }}>
        <NumberInput
          size="xs"
          value={quantity(item)}
          onChange={(value) => handleQuantityChange(value, item)}
        />
      </Table.Td>
      <Table.Td c="dimmed">
        {overridenQuantity(item) ? item.quantity : ""}
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={translated.buyOnline}>
            <ActionIcon 
              variant="subtle" 
              color="blue" 
              onClick={() => item.onlineShopLink && item.onlineShopLink.length > 0 ? openInBrowser(item.onlineShopLink[0]) : null}
              disabled={!item.onlineShopLink || item.onlineShopLink.length === 0}
            >
              <ShoppingCart size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={translated.edit}>
            <ActionIcon 
              variant="subtle" 
              color="gray"
              onClick={() => {
                setSelectedCategory(item)
                setEditModalOpened(true)
              }}
            >
              <Pencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={translated.delete(item.productType)}>
            <ActionIcon 
              variant="subtle" 
              color="red"
              onClick={() => handleDeleteCategory(item)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Container fluid>
      <Group gap="xs" mb="md" align="flex-start" justify='space-between'>
        <Title order={1}>{translated.title}</Title>
        <Group gap="xs">
          <Tooltip label={translated.addCategory}>
            <Button disabled={!filesExist.categories} color="blue" variant="filled" onClick={() => setAddModalOpened(true)}>
              <Plus size={24} />
            </Button>
          </Tooltip>
          <ResetDatabases />
        </Group>
      </Group>
      
      {/* Show error message if there's an error */}
      {error && (
        <Alert color="red" title={translated.errorSavingFile} mb="md">
          {error}
        </Alert>
      )}

      {filesExist.categories ? (
        <>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {productData.lastCategoriesUpdate && (
                <Text size="sm" c="dimmed" mb="md">
                  {translated.lastUpdated} {new Date(productData.lastCategoriesUpdate).toLocaleDateString()}
                </Text>
              )}

              <FilterComponent
                searchValue={searchFilter}
                onSearchChange={setSearchFilter}
                categoryType={categoryType}
                onCategoryTypeChange={setCategoryType}
              />

              <Table withRowBorders={false} highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{translated.productType}</Table.Th>
                    <Table.Th>{translated.description}</Table.Th>
                    <Table.Th>{translated.quantity}</Table.Th>
                    <Table.Th></Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </>
          )}
        </>
      ) : (
        <InitDatabases />
      )}
      
      {/* Edit Category Modal */}
      {selectedCategory && (
        <EditCategoryModal
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          category={selectedCategory}
        />
      )}
      
      {/* Add Category Modal */}
      <AddCategoryModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
    </Container>
  )
}

export default RecommendedScreen
