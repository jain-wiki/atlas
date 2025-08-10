// API related to Rectangle Box (i.e. first 5 characters of DigiPin)

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';

import { db } from '../lib/db'
import { getBoundingBoxFromDigiPINPrefix, getDigipinPrefix } from '@atlas/utils/digipinutils';
import type { LocationRestriction } from '@atlas/types/maps';
import { getTemplesFromGoogleMaps } from '../helper/gmaps1';
import { insertPlaces } from '../helper/gmapsdb';
import { dayjs } from '@atlas/utils'

export const gRect = new Hono()

gRect.post('/saveplace',
  zValidator('json',
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })),
  async (c) => {
    const { latitude, longitude } = c.req.valid('json');
    const digipin5 = getDigipinPrefix(latitude, longitude);

    const { maxLat, maxLng, minLat, minLng } = getBoundingBoxFromDigiPINPrefix(digipin5);

    const locationRestriction: LocationRestriction = {
      rectangle: {
        // The low point marks the southwest corner of the rectangle, and the high point represents the northeast corner of the rectangle.
        low: { latitude: minLat, longitude: minLng }, // South West
        high: { latitude: maxLat, longitude: maxLng } // North East
      }
    }

    const places = await getTemplesFromGoogleMaps(locationRestriction)
    insertPlaces(places); // save to db
    // Since there was no error, update the rectangle in the rect table
    const updatedAt = dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
    db.run('INSERT OR REPLACE INTO rect (id, updatedAt) VALUES (?, ?);', [digipin5, updatedAt]);

  });
