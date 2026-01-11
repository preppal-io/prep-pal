import React, { createContext, useState, useEffect, useContext } from 'react'
import { readUserProfile, writeUserProfile } from '../utils/fileUtils'
import { useLittera, useLitteraMethods } from '@assembless/react-littera'
import defaultUserProfile from '../data/user.json'

const translations = {
  failedLoadingProfile: {
    fr_CH: "Échec du chargement du profil utilisateur",
    de_CH: "Fehler beim Laden des Benutzerprofils",
    en_US: "Failed to load user profile"
  },
  failedSavingProfile: {
    fr_CH: "Échec de l'enregistrement du profil utilisateur",
    de_CH: "Fehler beim Speichern des Benutzerprofils",
    en_US: "Failed to save user profile"
  }
}

const UserContext = createContext()

// Custom hook to use the user context
export const useUserContext = () => useContext(UserContext)

// Provider component
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({ ...defaultUserProfile })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const translated = useLittera(translations)
  const methods = useLitteraMethods()

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update user profile when language changes
  useEffect(() => {
    if (methods.locale && userProfile.preferredLanguage !== methods.locale) {
      updateUserProfile({ preferredLanguage: methods.locale })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.locale])

  // Function to load user profile from disk or localStorage
  const loadUserProfile = async () => {
    try {
      setLoading(true)
      
      console.log('Loading user profile')
      
      const data = await readUserProfile()
      
      console.log('Loaded user profile:', data)
      
      setUserProfile(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load user profile:', err)
      // Use default profile if there's an error
      console.log('Using default user profile')
      
      // Try to save the default profile in parallel
      saveUserProfile(defaultUserProfile).catch(saveErr => {
        console.error('Failed to save default user profile:', saveErr)
      })
      
      setError(translated.failedLoadingProfile)
    } finally {
      setLoading(false)
    }
  }

  // Function to save user profile to disk or localStorage
  const saveUserProfile = async (data) => {
    try {
      setLoading(true)
      
      console.log('Saving user profile:', data)
      
      await writeUserProfile(data)
      
      setUserProfile(data)
      setError(null)
      return true
    } catch (err) {
      console.error('Failed to save user profile:', err)
      setError(translated.failedSavingProfile)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Function to update user profile
  const updateUserProfile = async (updates) => {
    try {
      const updatedProfile = {
        ...userProfile,
        ...updates
      }
      
      return await saveUserProfile(updatedProfile)
    } catch (err) {
      console.error('Failed to update user profile:', err)
      setError(translated.failedSavingProfile)
      return false
    }
  }

  const value = {
    userProfile,
    loading,
    error,
    loadUserProfile,
    saveUserProfile,
    updateUserProfile
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
