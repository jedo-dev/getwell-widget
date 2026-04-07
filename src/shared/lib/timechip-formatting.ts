export const formatTimeFromDateTime = (dateTime: string): string => {
  const [, timePart] = dateTime.split(' ');
  const [hh, mm] = timePart.split(':');
  return `${hh}:${mm}`;
};

export const localDateTimeToIso = (dateTime: string): string => {
  const [datePart, timePart] = dateTime.split(' ');
  return `${datePart}T${timePart}`;
};
