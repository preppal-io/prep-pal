import { TextInput, SegmentedControl, Group } from '@mantine/core'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { useLittera } from '@assembless/react-littera'

// Exported constants for reuse in other components
export const CATEGORY_TYPES = ['food', 'consumable', 'equipment']

export const categoryTypeTranslations = {
  food: {
    fr_CH: "Alimentation",
    de_CH: "Lebensmittel",
    en_US: "Food"
  },
  consumable: {
    fr_CH: "Consommables",
    de_CH: "Verbrauchsgüter",
    en_US: "Consumable"
  },
  equipment: {
    fr_CH: "Équipement",
    de_CH: "Ausrüstung",
    en_US: "Equipment"
  }
}

const translations = {
  searchPlaceholder: {
    fr_CH: "Rechercher une catégorie...",
    de_CH: "Kategorie suchen...",
    en_US: "Search category..."
  },
  all: {
    fr_CH: "Tous",
    de_CH: "Alle",
    en_US: "All"
  },
  ...categoryTypeTranslations
}

function FilterComponent({
  searchValue,
  onSearchChange,
  categoryType = 'all',
  onCategoryTypeChange
}) {
  const translated = useLittera(translations)

  return (
    <Group gap="md" mb="md">
      <TextInput
        placeholder={translated.searchPlaceholder}
        leftSection={<MagnifyingGlass size={16} />}
        value={searchValue}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        style={{ flex: 1, maxWidth: 300 }}
      />
      <SegmentedControl
        value={categoryType}
        onChange={onCategoryTypeChange}
        data={[
          { label: translated.all, value: 'all' },
          { label: translated.food, value: 'food' },
          { label: translated.consumable, value: 'consumable' },
          { label: translated.equipment, value: 'equipment' }
        ]}
      />
    </Group>
  )
}

export default FilterComponent
