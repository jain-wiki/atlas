import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js'
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
// import minMax from 'dayjs/plugin/minMax.js';
import calendar from 'dayjs/plugin/calendar.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
// import advancedFormat from 'dayjs/plugin/advancedFormat.js';

// Extend dayjs
dayjs.extend(quarterOfYear)
dayjs.extend(utc) // This has to be before timezone
dayjs.extend(timezone) // This has to be after utc
dayjs.extend(customParseFormat)
// dayjs.extend(minMax)
dayjs.extend(calendar)
dayjs.extend(relativeTime)
// dayjs.extend(advancedFormat)


export { dayjs }