workspace "PrepPal" "Emergency Preparedness Stock Management Application" {

    model {
        # People
        user = person "User" "A person managing their emergency preparedness stock inventory"

        # External Systems
        github = softwareSystem "GitHub Releases" "Hosts application releases and provides auto-update functionality" "External"

        # PrepPal System
        preppal = softwareSystem "PrepPal" "Hybrid desktop/web application for managing emergency preparedness stock, tracking inventory, and generating shopping lists" {

            # Containers
            reactApp = container "React Web Application" "Single-page application providing the user interface for stock management" "React 18, Vite, Mantine v8" "WebBrowser" {

                # State Management Components
                productContext = component "ProductContext" "Manages product categories and stock data state, provides CRUD operations for inventory" "React Context"
                userContext = component "UserContext" "Manages user profile and preferences including language settings" "React Context"

                # Screen Components
                recommendedScreen = component "RecommendedScreen" "Displays and manages recommended product categories and quantities based on household size and days of preparedness" "React Component"
                currentScreen = component "CurrentScreen" "Manages current stock inventory with expiry date tracking and quantity management" "React Component"
                shoppingListScreen = component "ShoppingListScreen" "Generates printable shopping lists based on inventory gaps between current and target quantities" "React Component"

                # UI Components
                initDatabases = component "InitDatabases" "Modal for initial setup - collects household size and preparedness duration" "React Component"
                addCategoryModal = component "AddCategoryModal" "Modal form for adding new product categories" "React Component"
                editCategoryModal = component "EditCategoryModal" "Modal form for editing existing product categories" "React Component"
                addStockItemModal = component "AddStockItemModal" "Modal form for adding new stock items to inventory" "React Component"
                itemDateChecker = component "ItemDateChecker" "Component for tracking and updating item check dates with visual state machine" "React Component"
                importExportDatabase = component "ImportExportDatabase" "Handles data export as JSON and import from JSON files" "React Component"
                resetDatabases = component "ResetDatabases" "Provides database reset functionality" "React Component"

                # Utilities
                fileUtils = component "File Utilities" "Abstraction layer for file I/O - handles both Electron IPC and localStorage transparently" "JavaScript Module"
                dateUtils = component "Date Utilities" "Date parsing, formatting, and comparison functions" "JavaScript Module"
                notificationUtils = component "Notification Utilities" "Toast notification management using Mantine notifications" "JavaScript Module"
                browserUtils = component "Browser Utilities" "Runtime environment detection and URL opening" "JavaScript Module"

                # Core App
                appShell = component "App Shell" "Main application shell with navigation, header, and routing" "React Component"
                router = component "Router" "HashRouter configuration for Electron compatibility" "React Router v7"
            }

            electronMain = container "Electron Main Process" "Desktop application wrapper providing native OS integration and file system access" "Electron 29, Node.js" {

                windowManager = component "Window Manager" "Creates and manages the BrowserWindow lifecycle" "Electron BrowserWindow"
                ipcHandlers = component "IPC Handlers" "Handles inter-process communication for file operations" "Electron IPC"
                autoUpdater = component "Auto-Updater" "Checks for and applies application updates from GitHub releases" "electron-updater"
            }

            fileStorage = container "File System Storage" "Stores application data in JSON files in user data directory" "JSON Files" "Database" {
                productCategoriesFile = component "productCategories.json" "Stores product categories with localized names, descriptions, and quantity settings" "JSON File"
                stockFile = component "stock.json" "Stores current inventory items with quantities and check dates" "JSON File"
                userProfileFile = component "userProfile.json" "Stores user preferences including language setting" "JSON File"
            }

            localStorage = container "Browser localStorage" "Stores application data in browser when running as web app" "Web Storage API" "Database"
        }

        # Relationships - System Context (Level 1)
        user -> preppal "Manages emergency stock inventory using"
        preppal -> github "Downloads application updates from" "HTTPS"

        # Relationships - Container (Level 2)
        user -> reactApp "Views and manages stock through" "HTTPS/File Protocol"
        reactApp -> electronMain "Communicates via" "Electron IPC"
        electronMain -> fileStorage "Reads and writes data to" "Node.js fs"
        electronMain -> github "Checks for updates from" "HTTPS"
        reactApp -> localStorage "Reads and writes data to" "Web Storage API"

        # Relationships - Components (Level 3)

        # App Shell relationships
        appShell -> router "Contains"
        router -> recommendedScreen "Routes to /recommended"
        router -> currentScreen "Routes to /current"
        router -> shoppingListScreen "Routes to /shopping-list"

        # Context relationships
        appShell -> productContext "Provides to children"
        appShell -> userContext "Provides to children"

        # Screen to Context relationships
        recommendedScreen -> productContext "Reads categories, calls addCategory, updateCategory, deleteCategory"
        currentScreen -> productContext "Reads stock and categories, calls saveStockData"
        shoppingListScreen -> productContext "Reads stock and categories to calculate shopping needs"

        # Screen to UI Component relationships
        recommendedScreen -> addCategoryModal "Opens for new category"
        recommendedScreen -> editCategoryModal "Opens for category editing"
        recommendedScreen -> initDatabases "Shows when no data exists"
        recommendedScreen -> resetDatabases "Contains reset button"
        currentScreen -> addStockItemModal "Opens for new stock item"
        currentScreen -> itemDateChecker "Uses for date tracking"

        # Context to Utilities relationships
        productContext -> fileUtils "Uses for data persistence"
        userContext -> fileUtils "Uses for profile persistence"

        # File Utils to Storage relationships
        fileUtils -> ipcHandlers "Calls via window.electron.ipcRenderer" "IPC"
        fileUtils -> localStorage "Reads/writes when in browser mode" "Web Storage API"

        # IPC Handlers to File Storage relationships
        ipcHandlers -> productCategoriesFile "Reads and writes"
        ipcHandlers -> stockFile "Reads and writes"
        ipcHandlers -> userProfileFile "Reads and writes"

        # Electron Main Process internal relationships
        windowManager -> reactApp "Loads"
        autoUpdater -> github "Fetches releases from" "HTTPS"

        # Import/Export relationships
        importExportDatabase -> productContext "Imports data via"
        importExportDatabase -> fileUtils "Exports data via"

        # UI Component to Utilities relationships
        addCategoryModal -> productContext "Calls addCategory"
        editCategoryModal -> productContext "Calls updateCategory"
        addStockItemModal -> productContext "Adds to stock"
        itemDateChecker -> dateUtils "Uses for date calculations"
        itemDateChecker -> productContext "Updates check dates via"

        # Notification relationships
        productContext -> notificationUtils "Shows save status"
        userContext -> notificationUtils "Shows save status"
    }

    views {
        # Level 1: System Context
        systemContext preppal "SystemContext" {
            include *
            autoLayout
            title "PrepPal - System Context"
            description "Shows PrepPal system and its external dependencies"
        }

        # Level 2: Container
        container preppal "Containers" {
            include *
            autoLayout
            title "PrepPal - Container Diagram"
            description "Shows the containers that make up the PrepPal application"
        }

        # Level 3: Component - React Application
        component reactApp "ReactAppComponents" {
            include *
            autoLayout
            title "React Web Application - Components"
            description "Shows the internal components of the React web application"
        }

        # Level 3: Component - Electron Main Process
        component electronMain "ElectronMainComponents" {
            include *
            autoLayout
            title "Electron Main Process - Components"
            description "Shows the internal components of the Electron main process"
        }

        # Level 3: Component - File Storage
        component fileStorage "FileStorageComponents" {
            include *
            autoLayout
            title "File System Storage - Components"
            description "Shows the data files stored by the application"
        }

        styles {
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "WebBrowser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
        }
    }

}
