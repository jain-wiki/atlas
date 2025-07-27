import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import db from '../lib/db'
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

  const oldPlace = await db('places').where({ id }).first()
  if (!oldPlace) {
    return c.json(createErrorResponse(ErrorMessages.PLACE_NOT_FOUND), 404)
  }
  const updatedPlace = {
    name: data.name,
    additional_names: data.additional_names || null,
    type_of_place: data.type_of_place,
    description: data.description || null,
    updated_at: db.fn.now(),
  }
  await db('places').where({ id }).update(updatedPlace)
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
  await db('places').insert(newPlace)
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
  const existingPlace = await db('places').where({ id }).first()
  if (!existingPlace) {
    return c.json(createErrorResponse(ErrorMessages.PLACE_NOT_FOUND), 404)
  }

  // Delete the place
  await db('places').where({ id }).del()

  // Log deletion in places_log table (user.email is guaranteed to exist due to check above)
  // @ts-ignore - user.email is guaranteed to exist due to check above
  await logPlaceAction(id, 'D', existingPlace, null, user.email)

  return c.json(createSuccessResponse({ id, deleted: true }))
})

