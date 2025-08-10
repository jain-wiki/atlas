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

const singleRecordFromRectStatement = db.prepare(
  `SELECT id, updatedAt FROM rect WHERE id = ? LIMIT 1;`)

gRect.post('/saveplace',
  zValidator('json',
    z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      digipin5: z.string().length(5).uppercase().optional()
    })),
  async (c) => {
    const { latitude, longitude, digipin5: digipin5Input } = c.req.valid('json');

    let digipin5;
    if (latitude && longitude) {
      digipin5 = getDigipinPrefix(latitude, longitude);
    } else {
      digipin5 = digipin5Input;
    }
    if (!digipin5) {
      throw new Error("Either digipin5 or both latitude and longitude must be provided");
    }

    // Check if we have already fetched the details in last 48 hours
    const lastFetched = singleRecordFromRectStatement.get(digipin5) as any;
    if (lastFetched && dayjs().diff(dayjs(lastFetched.updatedAt), 'hour') < 48) {
      return c.json({
        success: true, show: true,
        message: 'Data already fetched recently',
        data: []
      });
    }

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

    return c.json({
      success: true, show: true,
      message: `${places.length} Places fetched and saved successfully`,
      data: places
    });

  });
