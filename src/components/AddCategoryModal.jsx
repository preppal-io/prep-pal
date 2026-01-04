import React, { useState } from 'react'
import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  FocusTrap,
  Select
} from '@mantine/core'
import { useProductContext } from '../context/ProductContext'
import { setSaveStatus } from '../utils/notificationUtils'
import { useLittera } from '@assembless/react-littera'
import { CATEGORY_TYPES, categoryTypeTranslations } from './FilterComponent'

const translations = {
  addCategory: {
    fr_CH: "Ajouter une nouvelle catégorie",
    de_CH: "Neue Kategorie hinzufügen",
    en_US: "Add new category"
  },
  productType: {
    fr_CH: "Type de produit",
    de_CH: "Produktart",
    en_US: "Product type"
  },
  description: {
    fr_CH: "Description et exemples",
    de_CH: "Beschreibung und Beispiele",
    en_US: "Description and examples"
  },
  quantity: {
    fr_CH: "Quantité recommandée",
    de_CH: "Empfohlene Menge",
    en_US: "Recommended quantity"
  },
  expiryDays: {
    fr_CH: "Jours avant vérification d'expiration",
    de_CH: "Tage bis zur Ablaufprüfung",
    en_US: "Days until expiry check"
  },
  defaultUnit: {
    fr_CH: "Unité par défaut",
    de_CH: "Standardeinheit",
    en_US: "Default unit"
  },
  onlineShopLink: {
    fr_CH: "Lien boutique en ligne",
    de_CH: "Online-Shop-Link",
    en_US: "Online shop link"
  },
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
  errorAddingCategory: (message) => ({
    fr_CH: `Erreur lors de l'ajout de la catégorie : ${message}`,
    de_CH: `Fehler beim Hinzufügen der Kategorie: ${message}`,
    en_US: `Error adding category: ${message}`
  }),
  addingCategory: {
    fr_CH: "Ajout d'une nouvelle catégorie...",
    de_CH: "Neue Kategorie wird hinzugefügt...",
    en_US: "Adding new category..."
  },
  categoryAddFailed: {
    fr_CH: "Échec de l'ajout de la catégorie",
    de_CH: "Fehler beim Hinzufügen der Kategorie",
    en_US: "Failed to add category"
  },
  categoryAdded: {
    fr_CH: "La catégorie a été ajoutée avec succès",
    de_CH: "Kategorie wurde erfolgreich hinzugefügt",
    en_US: "Category was successfully added"
  },
  productTypePlaceholder: {
    fr_CH: "Entrez le type de produit",
    de_CH: "Produktart eingeben",
    en_US: "Enter product type"
  },
  descriptionPlaceholder: {
    fr_CH: "Entrez la description",
    de_CH: "Beschreibung eingeben",
    en_US: "Enter description"
  },
  quantityPlaceholder: {
    fr_CH: "Entrez la quantité recommandée",
    de_CH: "Empfohlene Menge eingeben",
    en_US: "Enter recommended quantity"
  },
  expiryDaysPlaceholder: {
    fr_CH: "Entrez le nombre de jours",
    de_CH: "Anzahl der Tage eingeben",
    en_US: "Enter number of days"
  },
  defaultUnitPlaceholder: {
    fr_CH: "Entrez l'unité par défaut",
    de_CH: "Standardeinheit eingeben",
    en_US: "Enter default unit"
  },
  onlineShopLinkPlaceholder: {
    fr_CH: "Entrez le lien de la boutique en ligne",
    de_CH: "Online-Shop-Link eingeben",
    en_US: "Enter online shop link"
  },
  categoryType: {
    fr_CH: "Type de catégorie",
    de_CH: "Kategorietyp",
    en_US: "Category type"
  },
  selectCategoryType: {
    fr_CH: "Sélectionnez un type",
    de_CH: "Typ auswählen",
    en_US: "Select a type"
  },
  ...categoryTypeTranslations
}

function AddCategoryModal({ opened, onClose }) {
  const [formData, setFormData] = useState({
    productType: '',
    description: '',
    quantity: 0,
    usualExpiryCheckDays: 180,
    defaultUnit: '',
    onlineShopLink: '',
    categoryType: 'food'
  })

  const { addCategory } = useProductContext()
  const translated = useLittera(translations)

  const handleSubmit = async () => {
    try {
      setSaveStatus({
        saving: true,
        success: null,
        message: translated.addingCategory,
        id: 'save-category'
      })

      // Prepare the new category data
      const newCategory = {
        productType: formData.productType,
        description: formData.description,
        quantity: formData.quantity,
        usualExpiryCheckDays: formData.usualExpiryCheckDays,
        defaultUnit: formData.defaultUnit,
        onlineShopLink: formData.onlineShopLink,
        categoryType: formData.categoryType
      }

      // Add the new category
      const result = await addCategory(newCategory)

      setSaveStatus({
        saving: false,
        success: result !== false,
        message: result !== false
          ? translated.categoryAdded
          : translated.categoryAddFailed,
        id: 'save-category'
      })

      if (result !== false) {
        onClose()
      }
    } catch (error) {
      setSaveStatus({
        saving: false,
        success: false,
        message: translated.errorAddingCategory(error.message),
        id: 'save-category'
      })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={translated.addCategory}
      size="md"
    >
      <Stack spacing="md">
        <FocusTrap active={true}>
          <TextInput
            label={translated.productType}
            placeholder={translated.productTypePlaceholder}
            value={formData.productType}
            onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            data-autofocus
            required
          />

          <Select
            label={translated.categoryType}
            placeholder={translated.selectCategoryType}
            data={CATEGORY_TYPES.map(type => ({
              value: type,
              label: translated[type]
            }))}
            value={formData.categoryType}
            onChange={(value) => setFormData({ ...formData, categoryType: value })}
            required
          />

          <TextInput
            label={translated.description}
            placeholder={translated.descriptionPlaceholder}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />

          <NumberInput
            label={translated.quantity}
            placeholder={translated.quantityPlaceholder}
            value={formData.quantity}
            onChange={(value) => setFormData({ ...formData, quantity: value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            min={0}
          />

          <NumberInput
            label={translated.expiryDays}
            placeholder={translated.expiryDaysPlaceholder}
            value={formData.usualExpiryCheckDays}
            onChange={(value) => setFormData({ ...formData, usualExpiryCheckDays: value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            min={0}
          />

          <TextInput
            label={translated.defaultUnit}
            placeholder={translated.defaultUnitPlaceholder}
            value={formData.defaultUnit}
            onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />

          <TextInput
            label={translated.onlineShopLink}
            placeholder={translated.onlineShopLinkPlaceholder}
            value={formData.onlineShopLink}
            onChange={(e) => setFormData({ ...formData, onlineShopLink: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />
        </FocusTrap>

        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>{translated.cancel}</Button>
          <Button onClick={handleSubmit} disabled={!formData.productType}>
            {translated.save}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default AddCategoryModal
