import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import { db } from '../lib/db'
import { logPlaceAction } from '../helper/placelog'
import { createSuccessResponse, createErrorResponse, ErrorMessages } from './middleware/responses'

export const placeUpdateRoutes = new Hono()

// Zod schema for place creation
const placeSchema = z.object({
  name1: z.string().min(1).max(100),
  name2: z.string().max(500).optional(),
  type: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  links: z.array(z.string().url()).optional(),
})

// PUT /api/p/place/:id - Edit Place (Protected)
placeUpdateRoutes.put('/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const parse = placeSchema.safeParse(body)
  if (!parse.success) {
    return c.json(createErrorResponse(ErrorMessages.VALIDATION_FAILED, parse.error.issues), 400)
  }
  const data = parse.data
  const user = (c as any).get('user') as { email?: string }

  if (!user.email) {
    return c.json(createErrorResponse(ErrorMessages.USER_EMAIL_MISSING), 400)
  }

  const selectQuery = db.query('SELECT * FROM places WHERE id = $id');
  const oldPlace = selectQuery.get({ $id: id });

  if (!oldPlace) {
    return c.json(createErrorResponse(ErrorMessages.PLACE_NOT_FOUND), 404)
  }

  const updatedPlace = {
    name1: data.name1,
    name2: data.name2 || null,
    type: data.type || null,
    description: data.description || null,
    lat: data.lat,
    lng: data.lng,
    links: data.links ? JSON.stringify(data.links) : null,
    updatedAt: new Date().toISOString(),
  }

  const updateQuery = db.query(`
    UPDATE places
    SET name1 = $name1, name2 = $name2, type = $type,
        description = $description, lat = $lat, lng = $lng, links = $links, updatedAt = $updatedAt
    WHERE id = $id
  `);

  updateQuery.run({
    $id: id,
    $name1: updatedPlace.name1,
    $name2: updatedPlace.name2,
    $type: updatedPlace.type,
    $description: updatedPlace.description,
    $lat: updatedPlace.lat,
    $lng: updatedPlace.lng,
    $links: updatedPlace.links,
    $updatedAt: updatedPlace.updatedAt,
  });

  // @ts-ignore - user.email is guaranteed to exist due to check above
  await logPlaceAction(id, 'U', oldPlace, updatedPlace, user.email)
  return c.json(createSuccessResponse({ id }))
})

// POST /api/p/place - Add Place (Protected)
placeUpdateRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parse = placeSchema.safeParse(body)
  if (!parse.success) {
    return c.json(createErrorResponse(ErrorMessages.VALIDATION_FAILED, parse.error.issues), 400)
  }
  const data = parse.data
  const id = nanoid(10)
  const user = (c as any).get('user') as { email?: string }

  if (!user.email) {
    return c.json(createErrorResponse(ErrorMessages.USER_EMAIL_MISSING), 400)
  }

  const newPlace = {
    id,
    name1: data.name1,
    name2: data.name2 || null,
    type: data.type || null,
    description: data.description || null,
    lat: data.lat,
    lng: data.lng,
    links: data.links ? JSON.stringify(data.links) : null,
  }

  const insertQuery = db.query(`
    INSERT INTO places (id, name1, name2, type, description, lat, lng, links)
    VALUES ($id, $name1, $name2, $type, $description, $lat, $lng, $links)
  `);

  insertQuery.run({
    $id: newPlace.id,
    $name1: newPlace.name1,
    $name2: newPlace.name2,
    $type: newPlace.type,
    $description: newPlace.description,
    $lat: newPlace.lat,
    $lng: newPlace.lng,
    $links: newPlace.links,
  });

  // @ts-ignore - user.email is guaranteed to exist due to check above
  await logPlaceAction(id, 'I', null, newPlace, user.email)
  return c.json(createSuccessResponse({ id }), 201)
})

// DELETE /api/p/place/:id - Delete Place (Protected)
placeUpdateRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()
  const user = (c as any).get('user') as { email?: string }

  if (!user.email) {
    return c.json(createErrorResponse(ErrorMessages.USER_EMAIL_MISSING), 400)
  }

  // Check if place exists before deleting
  const selectQuery = db.query('SELECT * FROM places WHERE id = $id');
  const existingPlace = selectQuery.get({ $id: id });

  if (!existingPlace) {
    return c.json(createErrorResponse(ErrorMessages.PLACE_NOT_FOUND), 404)
  }

  // Delete the place
  const deleteQuery = db.query('DELETE FROM places WHERE id = $id');
  deleteQuery.run({ $id: id });

  // Log deletion in places_log table (user.email is guaranteed to exist due to check above)
  // @ts-ignore - user.email is guaranteed to exist due to check above
  await logPlaceAction(id, 'D', existingPlace, null, user.email)

  return c.json(createSuccessResponse({ id, deleted: true }))
})

