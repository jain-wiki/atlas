import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';

import { db } from '../lib/db'

export const gPlace = new Hono()

gPlace.get('/list',
  zValidator('query',
    z.object({
      digipin5: z.string().optional(),
      locality: z.string().optional(),
      administrativeArea: z.string().optional(),
      classification: z.enum([
        'pending', // Null filter
        'accepted', // Accepted
        'T', // Temple
        'C', // Community
        'R', // Rejected
      ]).optional(),
      // Pagination
      pageNo: z.coerce.number().max(100).min(1).default(1),
      pageLimit: z.coerce.number().max(1000).min(1).default(20),
    })),
  async (c) => {

    const { pageNo, pageLimit,
      digipin5, locality, administrativeArea, classification } = c.req.valid('query');


    let sql = 'SELECT * FROM gmaps_places WHERE 1=1';
    const params: any = {};

    if (digipin5) {
      sql += ' AND digipin5 = $digipin5';
      params.digipin5 = digipin5;
    }
    if (locality) {
      sql += ' AND locality = $locality';
      params.locality = locality;
    }
    if (administrativeArea) {
      sql += ' AND administrativeArea = $administrativeArea';
      params.administrativeArea = administrativeArea;
    }
    if (classification) {
      switch (classification) {
        case 'pending':
          sql += ` AND classification IS NULL`;
          break;

        case 'accepted':
          sql += ` AND (classification IS NOT NULL AND classification <> 'R')`;
          break;

        default:
          sql += ' AND classification = $classification';
          params.classification = classification;
          break;
      }
    }

    sql += ' LIMIT $limit OFFSET $offset';
    params.limit = Number(pageLimit);
    params.offset = Number(pageNo - 1) * Number(pageLimit);

    const query = db.query(sql);
    const results = query.all(params);
    return c.json({
      success: true,
      data: results,
      pageNo: Number(pageNo),
      pageLimit: Number(pageLimit),
    });
  });


const updateClassificationStatement = db.query(
  'UPDATE gmaps_places SET classification = $classification WHERE id = $placeId;');

gPlace.patch('/classify/:placeId',
  zValidator('json',
    z.object({
      classification: z.enum([
        'T', // Temple
        'C', // Community
        'R', // Rejected
      ]),
    })),
  async (c) => {
    const { placeId } = c.req.param();
    const { classification } = c.req.valid('json');

    updateClassificationStatement.run({
      classification,
      placeId,
    });

    return c.json({
      success: true,
      show: true,
      message: 'Place classification updated',
    });

  })