export const getAbbreviations = (countries) => {
  const abbreviations = [];

  countries?.forEach((country) => {
    if (country === 'TAIWAN, PROVINCE OF CHINA') {
      abbreviations.push(CountriesAbbreviations.TAIWAN);
    } else if (country === 'HONG KONG SAR*)') {
      abbreviations.push(CountriesAbbreviations.HONG_KONG_SAR);
    } else {
      const temp = country.replace(/ /g, '_');
      abbreviations.push(CountriesAbbreviations[temp]);
    }
  });

  return abbreviations;
};

export enum CountriesAbbreviations {
  CROATIA = 'HR',
  GREECE = 'GR',
  SWEDEN = 'SE',
  ESTONIA = 'EE',
  HUNGARY = 'HU',
  BULGARIA = 'BG',
  SPAIN = 'ES',
  ROMANIA = 'RO',
  SLOVENIA = 'SI',
  NORWAY = 'NO',
  UNITED_KINGDOM = 'UK',
  CYPRUS = 'CY',
  POLAND = 'PL',
  CZECH_REPUBLIC = 'CZ',
  SLOVAKIA = 'SK',
  FRANCE = 'FR',
  LATVIA = 'LV',
  LITHUANIA = 'LT',
  SWITZERLAND = 'CH',
  PORTUGAL = 'PT',
  AUSTRIA = 'AT',
  BELGIUM = 'BE',
  FINLAND = 'FI',
  DENMARK = 'DK',
  MALTA = 'MT',
  LUXEMBOURG = 'LU',
  ITALY = 'IT',
  IRELAND = 'IE',
  GERMANY = 'DE',
  NETHERLANDS = 'NL',
  SOUTH_AFRICA = 'ZA',
  SINGAPORE = 'SG',
  NEW_ZEALAND = 'NZ',
  ISRAEL = 'IL',
  INDONESIA = 'ID',
  THAILAND = 'TH',
  INDIA = 'IN',
  ICELAND = 'IS',
  MALAYSIA = 'MY',
  AUSTRALIA = 'AU',
  REPUBLIC_OF_THE_PHILIPPINES = 'PH',
  TURKEY = 'TR',
  CANADA = 'CA',
  CHILE = 'CL',
  BRAZIL = 'BR',
  MEXICO = 'MX',
  ARGENTINA = 'AR',
  TAIWAN = 'TW',
  HONG_KONG_SAR = 'HK',
  CHINA = 'CN',
  UNITED_STATES = 'US',
}
