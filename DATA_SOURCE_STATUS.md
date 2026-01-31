# Data Source Status Report

## Real-Time Data (Use with Confidence)
1.  **Weather Conditions**: ✅ **100% Real**. Sourced from OpenWeatherMap. Includes Temperature, Wind Speed, Visibility.
2.  **Sea State (Waves)**: ✅ **100% Real**. Sourced from Open-Meteo Marine API. Includes Wave Height and Direction.

## Hybrid Data (Real + Fallback)
1.  **Vessels / Ships**: ⚠️ **Hybrid**. 
    - **Logic**: The system constantly scans for real AIS data. 
    - **Real**: If a real ship is found via AISStream, it is displayed.
    - **Simulated**: If **NO** real ships are found (due to API limits or empty area), the system generates **"Simulated Vessels"** so the map is not empty.
    - **Check**: Look for the "Simulated" flag on the vessel popup or the status indicator in the header.

## Simulated Data (Fixed)
1.  **Alerts**: ⚠️ **Logic-Based**. Alerts are generated programmatically based on the (real) weather. E.g., if real wind > 20 knots, the *app* creates a "High Wind" alert. It is not an official government feed.
2.  **Maritime Boundaries**: ⚠️ **Approximate**. The polygon lines for EEZ/Territorial waters are drawn based on approximate coordinates, not official hydrographic survey data.

---
**Summary for Presentation:**
"The dashboard uses live satellite weather and wave data. For vessel traffic, it displays live AIS data where available, but seamlessly transitions to a simulation mode to demonstrate capability in low-traffic areas."
