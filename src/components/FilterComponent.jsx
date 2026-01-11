import { TextInput, SegmentedControl, Group, Center } from '@mantine/core'
import { MagnifyingGlass, Carrot, HandSoap, Wrench } from '@phosphor-icons/react'
import { useLittera } from '@assembless/react-littera'

// Exported constants for reuse in other components
export const CATEGORY_TYPES = ['food', 'consumable', 'equipment']

// Icon mapping for category types
export const CATEGORY_TYPE_ICONS = {
  food: Carrot,
  consumable: HandSoap,
  equipment: Wrench
}

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
          { label: <Center style={{ gap: 6 }}><Carrot size={16} /> {translated.food}</Center>, value: 'food' },
          { label: <Center style={{ gap: 6 }}><HandSoap size={16} /> {translated.consumable}</Center>, value: 'consumable' },
          { label: <Center style={{ gap: 6 }}><Wrench size={16} /> {translated.equipment}</Center>, value: 'equipment' }
        ]}
      />
    </Group>
  )
}

export default FilterComponent
