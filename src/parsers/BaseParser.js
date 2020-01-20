import get from 'lodash/get';
import { GEOGRAPHY_OPTIONS, GOOGLE_ADDRESS_BOROUGH, EVENTS } from '../constants';
 import {createClient} from '@google/maps'
 import { GOOGLE_API_KEY } from 'secrets';
 import ChromeService from '../services/ChromeService'

 const googleMapsClient = createClient({
  key: GOOGLE_API_KEY,
  Promise: Promise
});

export default class BaseParser {
  constructor({ document, source }) {
    this.document = document;
    this.source = source;
  }

  async getCompFromDocument() {
    return {};
  }

  async getLocationInfoFromAddress ({ address = "", zip }) {
    const response = await googleMapsClient.geocode({ address: `${address} ${zip}` }).asPromise();
    const addressInfo = get(response, 'json.results.0');
    const location = {};

    const addressComponents = get(addressInfo, 'address_components') || [];
    for (const part of addressComponents) {
      part.types.forEach(type => {
        location[type] = { short: part.short_name, long: part.long_name };
      });
    }
    let borough = {};

    const state = get(location, 'administrative_area_level_1.short');
    let city = location.locality || addressInfo.sublocality || addressInfo.neighborhood;

    if (state === 'NJ') {
      city = get(location, 'administrative_area_level_3') || get(location, 'locality');
    } else if (state === 'NY') {
      city = location.sublocality || location.locality || {};
      borough = {
        short: GOOGLE_ADDRESS_BOROUGH[city.short],
        long: GOOGLE_ADDRESS_BOROUGH[city.long],
      };
    }

    let locationIdentifier = GEOGRAPHY_OPTIONS[state] || GEOGRAPHY_OPTIONS.OTHER;

    if (state === 'NY' && !borough.long) {
      locationIdentifier = GEOGRAPHY_OPTIONS.OTHER;
    }
    const coords = {
      longitude: get(addressInfo, 'geometry.location.lng'),
      latitude: get(addressInfo, 'geometry.location.lat'),
    };

    return {
      address: `${get(location, 'street_number.long')} ${get(location, 'route.long')}`,
      city: city ? city.short : '',
      zip: location.postal_code ? location.postal_code.short : '',
      state,
      locationIdentifier,
      coords,
    };
  };

  async parse() {
    const comp = await this.getCompFromDocument()
    ChromeService.emit({ type: EVENTS.COMP_PARSED, data: comp });
  }
}