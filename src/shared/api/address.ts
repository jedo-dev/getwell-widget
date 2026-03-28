import { FilialApiData } from './widget-settings-cache';

function normalizeAddressPart(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function formatResidentialAddress(address: FilialApiData['residential_address']): string {
  if (!address) {
    return '';
  }

  const parts = [
    normalizeAddressPart(address.settlement),
    normalizeAddressPart(address.district),
    normalizeAddressPart(address.street),
    normalizeAddressPart(address.house),
    normalizeAddressPart(address.hull),
    normalizeAddressPart(address.apartment),
  ];

  return parts.filter((part): part is string => Boolean(part)).join(', ');
}
