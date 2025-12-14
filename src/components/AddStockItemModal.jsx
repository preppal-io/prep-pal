import React, { useState } from 'react'
import { 
  Modal, 
  TextInput, 
  NumberInput, 
  Button, 
  Group, 
  Stack,
  Text, 
  FocusTrap
} from '@mantine/core'
import { useProductContext } from '../context/ProductContext'
import { getTodayFormatted, addDays } from '../utils/dateUtils'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'

const translations = {
  addItemToStock: (categoryName) => ({
    fr_CH: `Ajouter un nouvel article à votre stock dans la catégorie ${categoryName}.`,
    de_CH: `Fügen Sie einen neuen Artikel zu Ihrem Bestand in der Kategorie ${categoryName} hinzu.`,
    en_US: `Add a new item to your stock in the ${categoryName} category.`
  }),
  productName: {
    fr_CH: "Nom du produit",
    de_CH: "Produktname",
    en_US: "Product name"
  },
  quantity: {
    fr_CH: "Quantité",
    de_CH: "Menge",
    en_US: "Quantity"
  },
  addToCategory: (categoryName) => ({
    fr_CH: `Ajouter un article à ${categoryName}`,
    de_CH: `Artikel zu ${categoryName} hinzufügen`,
    en_US: `Add item to ${categoryName}`
  }),
  save: {
    fr_CH: "Enregistrer",
    de_CH: "Speichern",
    en_US: "Save"
  },
  cancel: {
    fr_CH: "Annuler",
    de_CH: "Abbrechen",
    en_US: "Cancel"
  },
  errorAddingItem: (message) => ({
    fr_CH: `Erreur lors de l'ajout de l'article : ${message}`,
    de_CH: `Fehler beim Hinzufügen des Artikels: ${message}`,
    en_US: `Error adding item: ${message}`
  }),
  itemAdded: (description, categoryName) => ({
    fr_CH: `Ajout de ${description} à ${categoryName}...`,
    de_CH: `Hinzufügen von ${description} zu ${categoryName}...`,
    en_US: `Adding ${description} to ${categoryName}...`
  }),
  itemAddFailed: (description, categoryName) => ({
    fr_CH: `Échec de l'ajout de ${description} à ${categoryName}`,
    de_CH: `Fehler beim Hinzufügen von ${description} zu ${categoryName}`,
    en_US: `Failed to add ${description} to ${categoryName}`
  }),
  itemAddedToCategory: (description, categoryName) => ({
    fr_CH: `${description} a été ajouté avec succès à ${categoryName}`,
    de_CH: `${description} wurde erfolgreich zu ${categoryName} hinzugefügt`,
    en_US: `${description} was successfully added to ${categoryName}` 
  }),
  quantityPlaceholder: {
    fr_CH: "Entrez la quantité",
    de_CH: "Menge eingeben",
    en_US: "Enter quantity"
  },
  unnamedProduct: {
    fr_CH: "Produit sans nom",
    de_CH: "Unbenanntes Produkt",
    en_US: "Unnamed product"
  },
  defaultNamePlaceholder: {
    fr_CH: "(Produit sans nom)",
    de_CH: "(Unbenanntes Produkt)",
    en_US: "(Unnamed product)"
  }
}

function AddStockItemModal({ opened, onClose, categoryId, categoryName }) {
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { productData, saveStockData } = useProductContext()
  
  const translated = useLittera(translations)

  const handleSubmit = async () => {
    try {
      // Use "Unnamed product" if description is empty
      const finalDescription = description.trim() || translated.unnamedProduct

      setSaveStatus({
        saving: true,
        success: null,
        message: translated.itemAdded(finalDescription, categoryName),
        id: 'save-stock-item'
      })

      // Get the category to determine check days
      const category = productData.baseCategories.find(cat => cat.id === categoryId)
      const checkDays = category?.usualExpiryCheckDays || 90 // Default to 90 days if not specified

      // Create new stock item
      const newItem = {
        typeId: categoryId,
        description: finalDescription,
        quantity,
        addedDate: getTodayFormatted(),
        checkedDate: getTodayFormatted(),
        nextCheck: addDays(getTodayFormatted(), checkDays)
      }
      
      // Add the new item to the stock
      const updatedStock = {
        ...productData.stock,
        products: [...productData.stock.products, newItem]
      }
      
      // Save the updated stock
      const success = await saveStockData(updatedStock)
      
      setSaveStatus({
        saving: false,
        success: success,
        message: success
          ? translated.itemAddedToCategory(finalDescription, categoryName)
          : translated.itemAddFailed(finalDescription, categoryName),
        id: 'save-stock-item'
      })
      
      if (success) {
        // Reset form and close modal
        setDescription('')
        setQuantity(1)
        onClose()
      }
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: translated.errorAddingItem(error.message),
        id: 'save-stock-item'
      })
    }
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={translated.addToCategory(categoryName)}
      size="md"
    >
      <Stack spacing="md">
        <FocusTrap active={true}>
          <Text size="sm" c="dimmed">
            {translated.addItemToStock(categoryName)}
          </Text>
          
          <TextInput
            label={translated.productName}
            placeholder={translated.defaultNamePlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quantity >= 1) {
                handleSubmit();
              }
            }}
          />

          <NumberInput
            label={translated.quantity}
            placeholder={translated.quantityPlaceholder}
            value={quantity}
            onChange={setQuantity}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quantity >= 1) {
                handleSubmit();
              }
            }}
            min={1}
            required
            data-autofocus
          />
        </FocusTrap>
        
        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>{translated.cancel}</Button>
          <Button onClick={handleSubmit} disabled={quantity < 1}>
            {translated.save}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default AddStockItemModal
