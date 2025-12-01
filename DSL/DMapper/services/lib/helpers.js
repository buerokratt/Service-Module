export function calculateDateDifference(value) {
  const { startDate, endDate, outputType } = value;
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const timeDifferenceInSeconds = (eDate.getTime() - sDate.getTime()) / 1000;

  switch (outputType?.toLowerCase()) {
    case 'years':
      return eDate.getFullYear() - sDate.getFullYear();
    case 'months':
      return eDate.getMonth() - sDate.getMonth() +
        (12 * (eDate.getFullYear() - sDate.getFullYear()))
    case 'hours':
      return Math.round(Math.abs(eDate - sDate) / 36e5);
    case 'minutes':
      return Math.floor(timeDifferenceInSeconds / 60);
    case 'seconds':
      return timeDifferenceInSeconds;
    default:
      return Math.round(timeDifferenceInSeconds / (3600 * 24));
  }
}
