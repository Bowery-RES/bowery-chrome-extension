export const UNIT_AMENITIES_LIST = [
  { label: 'Laundry - In Unit', value: 'unitLaundry' },
  { label: 'Laundry - Building', value: 'buildingLaundry' },
  { label: 'Terrace', value: 'terrace' },
  { label: 'Backyard', value: 'backyard' },
];

export const UNIT_TYPES_LIST = [
'Duplex',
'Triplex',
'Simplex',
'Penthouse',
'Loft',
'Garden Style',
'Basement',
'Garage',
]

export const STREET_EASY_AMENITIES_MAP = {
  washer_dryer: 'unitLaundry',
  laundry: 'buildingLaundry',
  terrace: 'terrace',
  backyard: 'backyard',
};

export const GEOGRAPHY_OPTIONS = {
  NY: 'New York',
  NJ: 'New Jersey',
  OTHER: 'Other',
};

export const GOOGLE_ADDRESS_BOROUGH = {
  Manhattan: 'Manhattan',
  Brooklyn: 'Brooklyn',
  'The Bronx': 'Bronx',
  Queens: 'Queens',
  'Staten Island': 'Staten Island',
};

export const EVENTS = {
  INITIALIZE: 'INITIALIZE',
  EXTENSION_OPEN: 'EXTENSION_OPEN',
  EXTENSION_CLOSE: 'EXTENSION_CLOSE',
  COMP_PARSED: 'COMP_PARSED',
  COMP_ADDED: 'COMP_ADDED',
  LAST_REPORT_INITIALIZE: 'LAST_REPORT_INITIALIZE'
};

export const WIDGET_ID = 'bowery-extension';