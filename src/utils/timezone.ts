// Timezone utilities

export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
}

const POPULAR_TIMEZONES = ['Asia/Tehran', 'Europe/Istanbul', 'Asia/Dubai', 'Europe/London', 'UTC'];

export const getTimezoneOptions = (): TimezoneOption[] => {
  const allTzs = Intl.supportedValuesOf('timeZone');
  
  // Format all timezones with their dynamic UTC offsets
  const formattedTzs = allTzs.map(tz => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'longOffset',
      }).formatToParts(new Date());
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      const offset = tzPart ? tzPart.value : 'GMT';
      return {
        id: tz,
        label: `${tz.replace('_', ' ')} (${offset})`,
        offset,
      };
    } catch (e) {
      return {
        id: tz,
        label: `${tz.replace('_', ' ')} (GMT)`,
        offset: 'GMT',
      };
    }
  });

  return formattedTzs;
};

export const getPopularTimezoneOptions = (allOptions: TimezoneOption[]): TimezoneOption[] => {
  return POPULAR_TIMEZONES.map(popId => {
    const found = allOptions.find(o => o.id === popId);
    if (found) return found;
    return { id: popId, label: `${popId} (GMT)`, offset: 'GMT' };
  });
};
