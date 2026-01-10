# Release notes

## `v0.11.0`

Date: `2026-01-04`

- Add category type filtering (renamed 'health' to 'consumable')
- Add reusable filter component for category search
- Add favicon and double-click on rows
- Fix expiry date check logic
- Make product name optional in add stock item modal
- Fix glob and other security vulnerabilities
- Linux build support improvements

## `v0.10.0`

Date: `2025-05-22`

- Add people and days selector to database initialization
- Adjust recommended quantities based on Swiss Confederation data

## `v0.9.2`

Date: `2025-05-10`

- Add user profile persistence with preferred language
- Add privacy-focused simple analytics with "do not track" option

## `v0.9.1`

Date: `2025-05-09`

- Prepare repository for public release
- Fix public pages

## `v0.9.0`

Date: `2025-05-08`

- Offline database for both web and desktop apps (local storage and json disk storage)
- Import or export databases to the local drive
- Generate a default database of product categories needs, based on the Swiss Confederation's recommendation
- Manage categories, recommended quantities, and default expiration/check durations
- Manage the current stock
  - Easily assign items to categories, manage quantities
  - Get visual feedback about understocked categories and possible expired items (or items needing checks)
  - Easily update stock items' check dates
- Print a shopping list with missing items. Possibility to hide or show items manually.
- Add buying links for items bought online
- Multilingual support (English, French, German)