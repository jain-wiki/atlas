import dj from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dj.extend(relativeTime);
dj.extend(customParseFormat);


export const dayjs = dj;
