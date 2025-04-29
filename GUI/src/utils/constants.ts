export enum DATE_CONSTANTS {
  TODAY = "new Date().toISOString().split('T')[0]",
  CURRENT_TIME = "new Date().toISOString().split('T')[1].replace('Z', '')",
  NOW = "new Date().toISOString()",
  YESTERDAY = "new Date(new Date().getTime() - 86400000).toISOString().split('T')[0]",
  TOMORROW = "new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]",
  CUSTOM = "new Date(YOUR_DATE).toISOString()",
};
