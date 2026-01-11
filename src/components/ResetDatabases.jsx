import React, { useState } from 'react'
import { useLittera } from '@assembless/react-littera'
import { Box, Button, Tooltip } from '@mantine/core'
import { useProductContext } from '../context/ProductContext'
import { StackMinus } from '@phosphor-icons/react'

const translations = {
  reset: {
    fr_CH: "Supprimer les bases de données",
    de_CH: "Datenbanken löschen",
    en_US: "Delete databases"
  },
  confirmReset: {
    fr_CH: "Appuyez à nouveau pour continuer",
    de_CH: "Drücken Sie erneut, um fortzufahren",
    en_US: "Press again to proceed"
  },
  cancel: {
    fr_CH: "Annuler",
    de_CH: "Abbrechen",
    en_US: "Cancel"
  },
}

function ResetDatabases() {
  const translated = useLittera(translations)
  const { resetDatabases } = useProductContext()
  const [ confirm, setConfirm ] = useState(false)

  const handleResetDatabases = async () => {
    if (!confirm) {
      setConfirm(true)
    } else {
      await resetDatabases()
      setConfirm(false)
    }
  }

  const handleCancel = () => {
    setConfirm(false)
  }

  return (
    <Box>
      {confirm && (
        <Button my="xs" variant="default" onClick={handleCancel}>
          {translated.cancel}
        </Button>
      )}
      <Tooltip label={confirm ? translated.confirmReset : translated.reset} withArrow>
        <Button variant={confirm ? "filled" : "light"} my="xs" color="red" onClick={handleResetDatabases}>
          <StackMinus size={24}/>
        </Button>
      </Tooltip>
    </Box>
  )
}

export default ResetDatabases
