import { Hono } from 'hono';
import { createSuccessResponse, createErrorResponse, ErrorMessages } from './middleware/responses';
import { db } from '../lib/db'

export const placeViewRoutes = new Hono();

// GET /api/place/list - List Places with filters and pagination
placeViewRoutes.get('/list', async (c) => {
  const { name, type, id, limit = 20, offset = 0 } = c.req.query();

  let sql = 'SELECT * FROM places WHERE 1=1';
  const params: any = {};

  if (name) {
    sql += ' AND (name1 LIKE $name OR name2 LIKE $name)';
    params.$name = `%${name}%`;
  }
  if (type) {
    sql += ' AND type = $type';
    params.$type = type;
  }
  if (id) {
    sql += ' AND id LIKE $id';
    params.$id = `${id}%`;
  }

  sql += ' LIMIT $limit OFFSET $offset';
  params.$limit = Number(limit);
  params.$offset = Number(offset);

  const query = db.query(sql);
  const results = query.all(params);

  return c.json(createSuccessResponse(results));
});


// GET /api/place/:id - View One Place
placeViewRoutes.get(':id', async (c) => {
  const { id } = c.req.param();

  const query = db.query('SELECT * FROM places WHERE id = $id');
  const place = query.get({ $id: id });

  if (!place) {
    return c.json(createErrorResponse(ErrorMessages.PLACE_NOT_FOUND), 404);
  }
  return c.json(createSuccessResponse(place));
});
