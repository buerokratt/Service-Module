export enum DATE_CONSTANTS {
  TODAY = "new Date().toISOString().split('T')[0]",
  CURRENT_TIME = "new Date().toISOString().split('T')[1].replace('Z', '')",
  NOW = "new Date().toISOString()",
  YESTERDAY = "new Date(Date.now() - 86400000).toISOString().split('T')[0]",
  TOMORROW = "new Date(Date.now() + 86400000).toISOString().split('T')[0]",
  CUSTOM = "new Date(YOUR_DATE).toISOString()",
  DMY = "new Intl.DateTimeFormat('en-GB').format(Date.now()).replaceAll('/','-')",
  CUSTOM_FORMAT = "MM,dd,yyyy, h:mm:ss a.replaceAll('yyyy', YOUR_DATE.getFullYear()).replaceAll('MMM', monthNames[YOUR_DATE.getMonth() - 2]).replaceAll('MM', String(YOUR_DATE.getMonth() + 1).padStart(2, '0')).replaceAll('dd', String(YOUR_DATE.getDate()).padStart(2, '0')).replaceAll('h', YOUR_DATE.getHours() % 12 || 12).replaceAll('hh', String(YOUR_DATE.getHours() % 12 || 12).padStart(2, '0')).replaceAll('HH', String(YOUR_DATE.getHours() % 24 || 24).padStart(2, '0')).replaceAll('mm', String(YOUR_DATE.getMinutes()).padStart(2, '0')).replaceAll('ss', String(YOUR_DATE.getSeconds()).padStart(2, '0')).replaceAll(' a', YOUR_DATE.getHours() < 12 ? ' AM' : ' PM')",
};
