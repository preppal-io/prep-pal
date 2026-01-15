import React, { useState, useEffect, useCallback } from 'react'
import { Container, Table, Title, Text, Group, Alert, Tooltip, Button, Stack } from '@mantine/core'
import { Plus } from '@phosphor-icons/react'
import EditCategoryModal from '../components/EditCategoryModal'
import AddCategoryModal from '../components/AddCategoryModal'
import InitDatabases from '../components/InitDatabases'
import FilterComponent, { CATEGORY_TYPE_ICONS } from '../components/FilterComponent'
import LoadingSpinner from '../components/LoadingSpinner'
import CategoryRow from '../components/CategoryRow'
import MobileCategoryCard from '../components/MobileCategoryCard'
import { useProductContext } from '../context/ProductContext'
import { useDebouncedCallback, useMediaQuery } from '@mantine/hooks'
import { setSaveStatus } from '../utils/notificationUtils'
import { openInBrowser } from '../utils/browserUtils'
import { useLittera, useLitteraMethods } from '@assembless/react-littera'
import ResetDatabases from '../components/ResetDatabases'
import { useFilteredCategories } from '../hooks/useFilteredCategories'
import { useScrollPreservation } from '../hooks/useScrollPreservation'
import { formatDateForDisplay } from '../utils/dateUtils'

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
  const { locale } = useLitteraMethods()
  const filteredData = useFilteredCategories(data, searchFilter, categoryType)
  const { saveScrollPosition, restoreScrollPosition } = useScrollPreservation()
  const isMobile = useMediaQuery('(max-width: 576px)')

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
    } catch {
      setSaveStatus({ saving: false, success: false, message: translated.saveError, id: 'save-status' })
    }
  }

  const debouncedSaveChanges = useDebouncedCallback(saveChanges, 500)

  const handleQuantityChange = (value, item) => {
    updateLocalState(value, item)
    debouncedSaveChanges(value, item)
  }

  const getQuantity = (item) => {
    if (item.quantityOverride || item.quantityOverride === 0) {
      return item.quantityOverride
    }
    return item.quantity
  }

  const isOverridden = (item) => {
    return (item.quantityOverride || item.quantityOverride === 0) && item.quantityOverride !== item.quantity
  }

  const handleOpenShop = (item) => {
    if (item.onlineShopLink?.length > 0) {
      openInBrowser(item.onlineShopLink[0])
    }
  }

  const handleEditCategory = useCallback((item) => {
    saveScrollPosition()
    setSelectedCategory(item)
    setEditModalOpened(true)
  }, [saveScrollPosition])

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpened(false)
    restoreScrollPosition()
  }, [restoreScrollPosition])

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
    } catch (err) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorDeletingCategory(err.message),
        id: 'save-category'
      })
    }
  }

  const rows = filteredData.map((item) => {
    const CategoryIcon = item.categoryType ? CATEGORY_TYPE_ICONS[item.categoryType] : null
    return (
      <CategoryRow
        key={item.productType}
        item={item}
        quantity={getQuantity(item)}
        isOverridden={isOverridden(item)}
        onQuantityChange={handleQuantityChange}
        onEdit={() => handleEditCategory(item)}
        onDelete={handleDeleteCategory}
        onOpenShop={() => handleOpenShop(item)}
        translated={translated}
        CategoryIcon={CategoryIcon}
      />
    )
  })

  const mobileCards = filteredData.map((item) => {
    const CategoryIcon = item.categoryType ? CATEGORY_TYPE_ICONS[item.categoryType] : null
    return (
      <MobileCategoryCard
        key={item.productType}
        item={item}
        quantity={getQuantity(item)}
        isOverridden={isOverridden(item)}
        onQuantityChange={handleQuantityChange}
        onEdit={() => handleEditCategory(item)}
        onDelete={handleDeleteCategory}
        onOpenShop={() => handleOpenShop(item)}
        translated={translated}
        CategoryIcon={CategoryIcon}
      />
    )
  })

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
                  {translated.lastUpdated} {formatDateForDisplay(productData.lastCategoriesUpdate, locale)}
                </Text>
              )}

              <FilterComponent
                searchValue={searchFilter}
                onSearchChange={setSearchFilter}
                categoryType={categoryType}
                onCategoryTypeChange={setCategoryType}
              />

              {isMobile ? (
                <Stack gap="xs" mt="md">
                  {mobileCards}
                </Stack>
              ) : (
                <Table withRowBorders={false} highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 32 }}></Table.Th>
                      <Table.Th>{translated.productType}</Table.Th>
                      <Table.Th>{translated.description}</Table.Th>
                      <Table.Th>{translated.quantity}</Table.Th>
                      <Table.Th></Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              )}
            </>
          )}
        </>
      ) : (
        <InitDatabases />
      )}

      {selectedCategory && (
        <EditCategoryModal
          opened={editModalOpened}
          onClose={handleCloseEditModal}
          category={selectedCategory}
        />
      )}

      <AddCategoryModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
    </Container>
  )
}

export default RecommendedScreen
