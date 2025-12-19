# Roadmap and features

## MVP

- [x] Online buying: 
    - [x] Move the link attribute to the categories
    - [x] Add the function to the categories (in stock management and categories)
- [x] remove setup page
    - [x] Initialize widget on each page that is empty
    - [x] Reset button in the categories page (top)
- [x] Categories
    - [x] Edit categories: add link, change unit, avg expiry
    - [x] Remove categories
    - [x] Add categories 
- [x] Export + import files (categories + stock)
- [x] Landing page (basic draft)
- [x] Landing page in the 3 languages at least
- [x] Put the downloadable artefacts on a public repository
- [x] Adapt the landing page for public release (link to feature/roadmap, FAQ, About, Contact, Help)
- [ ] Tests: on iPad + on Windows for installation
- [x] Language: store the selected language preference
- [x] Minimum, privacy focused analytics

## Recommendations

- [x] Stock item type model + recommended model
- [x] Recommended screen from static file
- [x] Load and save to disk / localstorage
- [x] Add a simple calculator based on nb of people in house + nb of days - based on CH recommendations

## Current stock

- [x] Model for current stock
- [x] Editor for current stock, assignment to categories
    - [x] items can be generic or precise
    - [x] multiple items per category possible
- [x] Add a way to tell when a stock item has been last checked (update the lastCheck + nextCheck fields)
- [ ] Differentiate products for consumptions (expiry date) and for usage (check date)
    - [ ] Check expiry date for consumption products that might be expired according to `lastCheck + avg expiry = expired potentially`
    - [ ] Check date for items without expiry (`lastCheck + avg expiry = recheck!`)
- [ ] Add a way to say "I got it", without having to specify a number on the category
- [ ] Add "default units" to the current stock, next to the number setting.
- [ ] Add a "place" field (to know where the item is supposed to be). 
- [ ] Possibility to edit stock items


## Shopping list

- [x] Compute a shopping list from category
- [x] Make it printable
- [x] Add default units to each item

## Infra and misc

- [x] Add possibility to delete the file to restart from scratch
- [x] Multi-language (FR, DE, EN)
- [ ] Add a profile ID (prepare for login)
- [ ] Redesign
    - [ ] better error display management - remove the popovers
    - [ ] better scroll control - stay on the same scroll level when closing/opening popovers (put popovers on the right?)
- [ ] Distribution
    - [x] rename repo
    - [x] use electron-builder to build and publish artefacts on Gitlhub (separate repo for now?)
    - [x] have it as a runner on gihub. Simple process: main goes to netlify, release tags create distributables
    - [x] document process: version inc + deploy
    - [ ] Sign code to have auto-updates?
- [ ] Logo for the app, and better branding
- [ ] Split repositories (landing page, basic "free" app, and SaaS! -> look at license!)

## Next

### Country and social

- [ ] Country specific calculator?
    - [ ] add the official swiss calculator
    - [ ] add the country selection (France?)
- [ ] Recommendations for basic readyness
- [ ] Blog / news / events / how tos (partnerships?) - per country, swiss first

### Mobile app

- [ ] Very simple mobile app? https://capacitorjs.com/
- [ ] QR Code to get shopping list on Mobile 
- [ ] QR code to be able to manage stock on mobile

### Online feature

- [ ] Anonymous account with online DB instead of offline
- [ ] Notifications
    - [ ] Notification center in the interface
    - [ ] Mobile? SMS? Email? -> Stock expiry and warnings
- [ ] Social recommendation: what other are buying for default categories (require unique ID of categories?)
- [ ] One click supply for specific items? (drop shipping API? Partnership? Small team? -> Swiss usual shops)
- [ ] Automatic resupply: when stock is low, get new supplies automatically for some vital items
- [ ] Supply chain grouping (local networks, or "social buying") to:
    - Resupply with group deals
    - Local "lead" >> gets a local view 
    - Needs grouping of user (opt-in or out of a "chapter")


# Known bugs

- [x] Fix: electron language detection