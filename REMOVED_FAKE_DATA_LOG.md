# Documentation of Removed Fake Data and Functions

## Overview
This document logs the removal of simulated/dummy vessel data and fallback logic to ensure the application relies purely on real-time API data source (AISStream).

## 1. Removed Functions

### `generateFakeVessels` (in `hooks/use-maritime-data.ts`)
- **Description:** This helper function generated random "simulated" ships around the user's location when real API data was unavailable or returned zero results.
- **Action:** Deleted effectively to prevent any fake ships from appearing on the map.

## 2. Modified Logic

### Vessel Data Fetching (`hooks/use-maritime-data.ts`)
- **Old Logic:**
  ```typescript
  const vessels = hasRealVessels ? realVessels : generateFakeVessels(...)
  ```
- **New Logic:**
  ```typescript
  const vessels = hasRealVessels ? realVessels : []
  ```
- **Implication:** If the AIS API returns no ships, the map will now correctly show **zero vessels** instead of generating fake ones. Users will see a blank sea if no real ships are nearby.

## 3. Removed API Routes

### `/api/vessels/route.ts` (Simulated Data Endpoint)
- **Status:** The code calling this endpoint has been bypassed/removed from the primary hook logic.
- **Note:** The file itself might still exist but is no longer used by the main dashboard loop for vessel fallback.

## 4. UI/UX Changes

### Header Status Indicator
- **Change:** Logic updated to reflect connection status.
- **Removed:** The label "Simulation (Fallback)" is no longer a valid state for vessels. It will now simply be "Real-Time" or "No Data".

---
**Conclusion:** The application is now configured to strictly display Real-World Data. No artificial entities will be injected into the view.
