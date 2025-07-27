import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import db from '../lib/db'
import { requireAuth } from './middleware/auth'
import { logPlaceAction } from '../helper/placelog'

export const placeViewRoutes = new Hono()

// Zod schema for place creation
const placeSchema = z.object({
  name: z.string().min(1).max(100),
  additional_names: z.string().max(500).optional(),
  type_of_place: z.string().length(1),
  description: z.string().max(1000).optional(),
})

// PUT /api/p/place/:id - Edit Place (Protected)
placeViewRoutes.put('/place/:id', requireAuth, async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const parse = placeSchema.safeParse(body)
  if (!parse.success) {
    return c.json({ error: 'Validation failed', details: parse.error.issues }, 400)
  }
  const data = parse.data
  const user = (c as any).get('user') as { email: string }
  const oldPlace = await db('places').where({ id }).first()
  if (!oldPlace) {
    return c.json({ error: 'Place not found' }, 404)
  }
  const updatedPlace = {
    name: data.name,
    additional_names: data.additional_names || null,
    type_of_place: data.type_of_place,
    description: data.description || null,
    updated_at: db.fn.now(),
  }
  await db('places').where({ id }).update(updatedPlace)
  await logPlaceAction(id, 'U', oldPlace, updatedPlace, user.email)
  return c.json({ data: { id } })
})

// POST /api/p/place - Add Place (Protected)
placeViewRoutes.post('/place', requireAuth, async (c) => {
  const body = await c.req.json()
  const parse = placeSchema.safeParse(body)
  if (!parse.success) {
    return c.json({ error: 'Validation failed', details: parse.error.issues }, 400)
  }
  const data = parse.data
  const id = nanoid(10)
  const user = (c as any).get('user') as { email: string }
  const newPlace = {
    id,
    name: data.name,
    additional_names: data.additional_names || null,
    type_of_place: data.type_of_place,
    description: data.description || null,
  }
  await db('places').insert(newPlace)
  await logPlaceAction(id, 'I', null, newPlace, user.email)
  return c.json({ data: { id } }, 201)
})
