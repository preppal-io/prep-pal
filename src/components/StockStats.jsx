import React, { useMemo } from 'react'
import { Group, Paper, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { CheckCircle, Warning, Clock } from '@phosphor-icons/react'
import { useProductContext } from '../context/ProductContext'
import { useLittera, useLitteraMethods } from '@assembless/react-littera'
import { LOW_STOCK_THRESHOLD } from '../constants'
import { formatDateForDisplay } from '../utils/dateUtils'

const translations = {
  categoriesOk: {
    fr_CH: 'Stock OK',
    de_CH: 'Lager OK',
    en_US: 'Stock OK',
  },
  lowStock: {
    fr_CH: 'Stock bas',
    de_CH: 'Niedriger Bestand',
    en_US: 'Low stock',
  },
  lastCheck: {
    fr_CH: 'Dernière action',
    de_CH: 'Letzte Aktion',
    en_US: 'Last action',
  },
  never: {
    fr_CH: 'Jamais',
    de_CH: 'Nie',
    en_US: 'Never',
  },
  categoriesOkTooltip: {
    fr_CH: 'Catégories avec un stock suffisant',
    de_CH: 'Kategorien mit ausreichendem Lagerbestand',
    en_US: 'Categories with sufficient stock',
  },
  lowStockTooltip: {
    fr_CH: 'Catégories avec un stock insuffisant',
    de_CH: 'Kategorien mit unzureichendem Lagerbestand',
    en_US: 'Categories with insufficient stock',
  },
  lastCheckTooltip: {
    fr_CH: 'Date de la dernière modification',
    de_CH: 'Datum der letzten Änderung',
    en_US: 'Date of the last modification',
  },
}

function StockStats() {
  const theme = useMantineTheme()
  const { productData, filesExist } = useProductContext()
  const translated = useLittera(translations)
  const { locale } = useLitteraMethods()

  // Calculate stock statistics
  const stats = useMemo(() => {
    if (!filesExist.categories || !filesExist.stock || !productData.baseCategories) {
      return { categoriesOk: 0, lowStockCategories: 0 }
    }

    let categoriesOk = 0
    let lowStockCategories = 0

    productData.baseCategories.forEach((category) => {
      const recommendedQty = category.quantityOverride || category.quantity

      // Skip categories with zero recommended quantity
      if (!recommendedQty || recommendedQty <= 0) {
        return
      }

      // Calculate total stock for this category
      const categoryStock =
        productData.stock?.products?.filter((item) => item.typeId === category.id) || []

      const totalQuantity = categoryStock.reduce((sum, item) => sum + (item.quantity || 0), 0)

      const stockPercentage = (totalQuantity / recommendedQty) * 100

      if (stockPercentage >= LOW_STOCK_THRESHOLD) {
        categoriesOk++
      } else {
        lowStockCategories++
      }
    })

    return { categoriesOk, lowStockCategories }
  }, [productData.baseCategories, productData.stock, filesExist])

  // Find the most recent checkedDate from stock items
  const mostRecentCheck = useMemo(() => {
    if (!filesExist.stock || !productData.stock?.products?.length) {
      return null
    }

    let latestDate = null

    productData.stock.products.forEach((item) => {
      if (item.checkedDate) {
        const itemDate = new Date(item.checkedDate)
        if (!latestDate || itemDate > latestDate) {
          latestDate = itemDate
        }
      }
    })

    return latestDate
  }, [productData.stock, filesExist])

  // Format last check date
  const formattedLastCheck = useMemo(() => {
    if (!mostRecentCheck) {
      return translated.never
    }

    return formatDateForDisplay(mostRecentCheck, locale)
  }, [mostRecentCheck, locale, translated.never])

  // Don't show stats if databases are not initialized
  if (!filesExist.categories || !filesExist.stock) {
    return null
  }

  return (
    <Group gap="xs" visibleFrom="sm">
      <Tooltip label={translated.categoriesOkTooltip} withArrow>
        <Paper
          px="xs"
          py={4}
          radius="sm"
          style={{
            backgroundColor: theme.colors.green[0],
            border: `1px solid ${theme.colors.green[3]}`,
          }}
        >
          <Group gap={6}>
            <CheckCircle size={16} weight="fill" color={theme.colors.green[6]} />
            <Text size="xs" fw={500} c="green.7">
              {stats.categoriesOk} {translated.categoriesOk}
            </Text>
          </Group>
        </Paper>
      </Tooltip>

      <Tooltip label={translated.lowStockTooltip} withArrow>
        <Paper
          px="xs"
          py={4}
          radius="sm"
          style={{
            backgroundColor:
              stats.lowStockCategories > 0 ? theme.colors.orange[0] : theme.colors.gray[0],
            border: `1px solid ${
              stats.lowStockCategories > 0 ? theme.colors.orange[3] : theme.colors.gray[3]
            }`,
          }}
        >
          <Group gap={6}>
            <Warning
              size={16}
              weight="fill"
              color={stats.lowStockCategories > 0 ? theme.colors.orange[6] : theme.colors.gray[5]}
            />
            <Text size="xs" fw={500} c={stats.lowStockCategories > 0 ? 'orange.7' : 'gray.6'}>
              {stats.lowStockCategories} {translated.lowStock}
            </Text>
          </Group>
        </Paper>
      </Tooltip>

      <Tooltip label={translated.lastCheckTooltip} withArrow>
        <Paper
          px="xs"
          py={4}
          radius="sm"
          style={{
            backgroundColor: theme.colors.blue[0],
            border: `1px solid ${theme.colors.blue[3]}`,
          }}
        >
          <Group gap={6}>
            <Clock size={16} weight="fill" color={theme.colors.blue[6]} />
            <Text size="xs" fw={500} c="blue.7">
              {formattedLastCheck}
            </Text>
          </Group>
        </Paper>
      </Tooltip>
    </Group>
  )
}

export default StockStats
