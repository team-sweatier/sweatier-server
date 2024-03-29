export function convertUTCDateToKST(date) {
  const utcDate = new Date(date);
  utcDate.setHours(utcDate.getHours() + 9);
  return utcDate;
}

export function convertDateToUTC(date) {
  const localDate = new Date(date);
  localDate.setHours(localDate.getHours() - 9);
  return localDate;
}

export function adjustDates(obj, dateConversionFunction) {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    //객체의 키와 연결된 값이 Date 일 경우 convertUTCDateToKST 적용
    if (obj[key] instanceof Date) {
      obj[key] = dateConversionFunction(obj[key]);
    }
    //아닐경우 재귀호출로 깊게 탐색
    else if (typeof obj[key] === 'object') {
      adjustDates(obj[key], dateConversionFunction);
    }
  }
}
