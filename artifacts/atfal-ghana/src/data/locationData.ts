export const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Northern Sector": {
    "Northern Region": ["Damongo", "Tamale", "Yendi"],
    "Upper East Region": ["Bolga", "Nalerigu", "Walewale"],
    "Upper West Region": ["Goripie", "Gurungu/Kalba", "Hamile", "Tumu", "Wa East", "Wa West"],
  },
  "Middle Sector": {
    "Ashanti Region": [
      "Amansie", "Denkyira", "Kumasi North", "Kumasi South",
      "Obuasi", "Oforikrom", "Sefwi", "Sekyere East", "Sekyere West",
    ],
    "Brong Ahafo Region": ["Sunyani", "Techiman"],
    "Eastern Region": ["Akim Oda", "Koforidua", "Nkawkaw"],
  },
  "Southern Sector": {
    "Greater Accra Region": ["Accra", "Kasoa", "Tema"],
    "Central East Region": [
      "Agona Zone", "Assikuma Bedum", "Essiam Zone", "Gomoa East", "Gomoa West",
    ],
    "Central West Region": [
      "Abura", "Assin", "Cape Coast", "Ekumfi", "Mankessim", "Saltpond", "Twifo",
    ],
    "Volta Region": ["Volta"],
    "Western Region": ["Sekondi", "Takoradi", "Tarkwa"],
  },
};

export const SECTORS = Object.keys(LOCATION_DATA);

export function getRegions(sector: string): string[] {
  return Object.keys(LOCATION_DATA[sector] ?? {});
}

export function getZones(sector: string, region: string): string[] {
  return LOCATION_DATA[sector]?.[region] ?? [];
}
