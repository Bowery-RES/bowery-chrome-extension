import get from 'lodash/get';
import intersection from 'lodash/intersection';
import words from 'lodash/words';
import secrets from 'secrets';
import $ from 'jquery';
import { UNIT_AMENITIES_LIST } from '@constants';

export const STREET_EASY_AMENITIES_MAP = {
    washer_dryer: 'unitLaundry',
    laundry: 'buildingLaundry',
    terrace: 'terrace',
    backyard: 'backyard',
};

const getListsOfAmenities = amenitiesList => {
    const unitAmenities = intersection(Object.keys(STREET_EASY_AMENITIES_MAP), amenitiesList);
    return unitAmenities.map(amenity =>
        UNIT_AMENITIES_LIST.find(pair => pair.value === STREET_EASY_AMENITIES_MAP[amenity]),
    );
};

const getLocationInfoFromAddress = async ({ address, zip }) => {
    const response = await $.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address},${zip}&key=${secrets.GOOGLE_API_KEY}`,
    );
    const addressInfo = get(response, 'results.0');
    const location = {};

    const addressComponents = get(addressInfo, 'address_components') || [];
    for (const part of addressComponents) {
        part.types.forEach(type => {
            location[type] = { short: part.short_name, long: part.long_name };
        });
    }

    const state = get(location, 'administrative_area_level_1.short');
    let city = location.locality || addressInfo.sublocality || addressInfo.neighborhood;

    if (state === 'NJ') {
        city = get(location, 'administrative_area_level_3') || get(location, 'locality');
    } else if (state === 'NY') {
        city = location.sublocality || location.locality || {};
    }

    const coords = {
        longitude: get(addressInfo, 'geometry.location.lng'),
        latitude: get(addressInfo, 'geometry.location.lat'),
    };

    return {
        address: get(addressInfo, 'formatted_address'),
        city: city ? city.short : '',
        zip: location.postal_code ? location.postal_code.short : '',
        state,
        coords,
    };
};

const getTextContent = selector => {
    const text = $(selector).text();
    return words(text).join(' ');
};

(async function parseComp() {
    const [, data = '[]'] = document.body.textContent.match(/dataLayer = (\[.*\]);/) || [];
    const [compData] = JSON.parse(data);

    const amenities = compData.listAmen.split('|');
    const buildingTitle = $('.building-title .incognito').text();
    const [, , unitNumber] = buildingTitle.match(/(.*) #(.*)/);
    const dateOfValue = $('.DetailsPage-priceHistory .Table tr:first-child .Table-cell--priceHistoryDate .Text')
        .text()
        .trim();
    const zip = get(compData, 'listZip');
    const address = getTextContent('.backend_data.BuildingInfo-item');
    const location = await getLocationInfoFromAddress({ zip, address });

    const result = {
        state: location.state,
        dateOfValue: new Date(dateOfValue).toISOString(),
        coords: location.coords,
        city: location.city,
        unitNumber,
        address: location.address,
        zip,
        rooms: get(compData, 'listRoom'),
        bedrooms: get(compData, 'listBed'),
        bathrooms: get(compData, 'listBath'),
        sqft: get(compData, 'listSqFt', ''),
        rent: get(compData, 'listPrice', ''),
        unitAmenities: getListsOfAmenities(amenities),
        sourceOfInformation: 'externalDatabase',
        sourceUrl: document.location.toString(),
        sourceName: 'StreetEasy',
    };

    chrome.extension.sendRequest({ type: 'comp-parsed', data: result, key: buildingTitle });
})();
