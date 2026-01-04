import React, { useState, useEffect } from 'react'
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
  editCategory: (categoryName) => ({
    fr_CH: `Modifier la catégorie ${categoryName}`,
    de_CH: `Kategorie ${categoryName} bearbeiten`,
    en_US: `Edit ${categoryName} category`
  }),
  description: {
    fr_CH: "Description",
    de_CH: "Beschreibung",
    en_US: "Description"
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
  errorUpdatingCategory: (message) => ({
    fr_CH: `Erreur lors de la mise à jour de la catégorie : ${message}`,
    de_CH: `Fehler beim Aktualisieren der Kategorie: ${message}`,
    en_US: `Error updating category: ${message}`
  }),
  updatingCategory: (categoryName) => ({
    fr_CH: `Mise à jour de la catégorie ${categoryName}...`,
    de_CH: `Aktualisierung der Kategorie ${categoryName}...`,
    en_US: `Updating ${categoryName} category...`
  }),
  categoryUpdateFailed: (categoryName) => ({
    fr_CH: `Échec de la mise à jour de la catégorie ${categoryName}`,
    de_CH: `Fehler beim Aktualisieren der Kategorie ${categoryName}`,
    en_US: `Failed to update ${categoryName} category`
  }),
  categoryUpdated: (categoryName) => ({
    fr_CH: `La catégorie ${categoryName} a été mise à jour avec succès`,
    de_CH: `Kategorie ${categoryName} wurde erfolgreich aktualisiert`,
    en_US: `${categoryName} category was successfully updated`
  }),
  descriptionPlaceholder: {
    fr_CH: "Entrez la description",
    de_CH: "Beschreibung eingeben",
    en_US: "Enter description"
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
  categoryTypeRequired: {
    fr_CH: "Le type de catégorie est requis",
    de_CH: "Kategorietyp ist erforderlich",
    en_US: "Category type is required"
  },
  ...categoryTypeTranslations
}

function EditCategoryModal({ opened, onClose, category }) {
  const [formData, setFormData] = useState({
    description: '',
    usualExpiryCheckDays: 0,
    defaultUnit: '',
    onlineShopLink: '',
    categoryType: ''
  })

  const { updateCategory } = useProductContext()
  const translated = useLittera(translations)

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        description: category.description || '',
        usualExpiryCheckDays: category.usualExpiryCheckDays || 0,
        defaultUnit: category.defaultUnit || '',
        onlineShopLink: category.onlineShopLink && category.onlineShopLink.length > 0
          ? category.onlineShopLink[0]
          : '',
        categoryType: category.categoryType || ''
      })
    }
  }, [category])

  const handleSubmit = async () => {
    if (!category) return
    
    try {
      setSaveStatus({ 
        saving: true, 
        success: null, 
        message: translated.updatingCategory(category.productType),
        id: 'save-category'
      })
      
      // Prepare the update data
      const updateData = {
        description: formData.description,
        usualExpiryCheckDays: formData.usualExpiryCheckDays,
        defaultUnit: formData.defaultUnit,
        onlineShopLink: formData.onlineShopLink ? [formData.onlineShopLink] : [],
        categoryType: formData.categoryType
      }
      
      // Update the category
      const success = await updateCategory(category.id, updateData)
      
      setSaveStatus({ 
        saving: false, 
        success: success, 
        message: success 
          ? translated.categoryUpdated(category.productType)
          : translated.categoryUpdateFailed(category.productType),
        id: 'save-category'
      })
      
      if (success) {
        onClose()
      }
    } catch (error) {
      setSaveStatus({ 
        saving: false, 
        success: false, 
        message: translated.errorUpdatingCategory(error.message),
        id: 'save-category'
      })
    }
  }

  if (!category) return null

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={translated.editCategory(category.productType)}
      size="md"
    >
      <Stack spacing="md">
        <FocusTrap active={true}>
          <Select
            label={translated.categoryType}
            placeholder={translated.selectCategoryType}
            data={CATEGORY_TYPES.map(type => ({
              value: type,
              label: translated[type]
            }))}
            value={formData.categoryType || null}
            onChange={(value) => setFormData({...formData, categoryType: value})}
            required
            error={!formData.categoryType ? translated.categoryTypeRequired : null}
            data-autofocus
          />

          <TextInput
            label={translated.description}
            placeholder={translated.descriptionPlaceholder}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.categoryType) {
                handleSubmit()
              }
            }}
          />
          
          <NumberInput
            label={translated.expiryDays}
            placeholder={translated.expiryDaysPlaceholder}
            value={formData.usualExpiryCheckDays}
            onChange={(value) => setFormData({...formData, usualExpiryCheckDays: value})}
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
            onChange={(e) => setFormData({...formData, defaultUnit: e.target.value})}
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
            onChange={(e) => setFormData({...formData, onlineShopLink: e.target.value})}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />
        </FocusTrap>
        
        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>{translated.cancel}</Button>
          <Button onClick={handleSubmit} disabled={!formData.categoryType}>
            {translated.save}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default EditCategoryModal
