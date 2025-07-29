import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import { db } from '../lib/db'
import { logPlaceAction } from '../helper/placelog'
import { createSuccessResponse, createErrorResponse, ErrorMessages } from './middleware/responses'

export const placeUpdateRoutes = new Hono()

// Zod schema for place creation
const placeSchema = z.object({
  name: z.string().min(1).max(100),
  additional_names: z.string().max(500).optional(),
  type_of_place: z.string().length(1),
  description: z.string().max(1000).optional(),
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
    name: data.name,
    additional_names: data.additional_names || null,
    type_of_place: data.type_of_place,
    description: data.description || null,
    updated_at: new Date().toISOString(),
  }

  const updateQuery = db.query(`
    UPDATE places
    SET name = $name, additional_names = $additional_names, type_of_place = $type_of_place,
        description = $description, updated_at = $updated_at
    WHERE id = $id
  `);

  updateQuery.run({
    $id: id,
    $name: updatedPlace.name,
    $additional_names: updatedPlace.additional_names,
    $type_of_place: updatedPlace.type_of_place,
    $description: updatedPlace.description,
    $updated_at: updatedPlace.updated_at,
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
    name: data.name,
    additional_names: data.additional_names || null,
    type_of_place: data.type_of_place,
    description: data.description || null,
  }

  const insertQuery = db.query(`
    INSERT INTO places (id, name, additional_names, type_of_place, description)
    VALUES ($id, $name, $additional_names, $type_of_place, $description)
  `);

  insertQuery.run({
    $id: newPlace.id,
    $name: newPlace.name,
    $additional_names: newPlace.additional_names,
    $type_of_place: newPlace.type_of_place,
    $description: newPlace.description,
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

