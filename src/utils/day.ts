import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.locale('ko');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

export const KST_OFFSET_HOURS = 9;

export const dayUtil = {
  day: (...args: Parameters<typeof dayjs>) => {
    return dayjs(...args);
  },
  startOfDay: (...args: Parameters<typeof dayjs>) => {
    return dayjs(...args)
      .startOf('day')
      .toDate();
  },
};
