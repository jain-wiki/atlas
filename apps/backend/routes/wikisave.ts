// API to Add/Update Items in wikibase

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { createWikiItem } from '../helper/wikiitem';
import { getCidFromGoogleMapsUri } from '@atlas/utils/src/maputils';
import { db } from '../lib/db';

export const wikiSave = new Hono()

// Ref: https://data.jain.wiki/wiki/Special:WhatLinksHere/Item:Q2
const instanceOfItems = {
  'C': 'Q42',
  'T': 'Q3',
} as const;
const sectItems = {
  'Digambar': 'Q8',
  'Shwetambar': 'Q9',
  'Terapanth': 'Q11',
  'Sthanakvasi': 'Q10',
} as const;


const updateMapsPlacesStatement = db.query(`
  UPDATE gmaps_places
  SET item = $itemId, classification = $classification
  WHERE id = $placeCid;`)


// Create a new item
wikiSave.post('/item',
  zValidator('json',
    z.object({
      // Required Fields
      label: z.string().max(100),
      description: z.string().max(500), // Generated from "addressLines" array
      classification: z.enum(['T', 'C']), // T for Temple, C for Community Center
      // Optional Fields
      sect: z.enum(['Digambar', 'Shwetambar', 'Terapanth', 'Sthanakvasi']).optional(),
      // Location related fields
      administrativeArea: z.string().max(100).optional(),
      locality: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      googleMapsUri: z.url(), // required
      googleMapsPlaceId: z.string().max(100), // required
    })),
  async (c) => {
    const {
      label, description,
      classification, sect,
      administrativeArea, locality, postalCode, googleMapsUri, googleMapsPlaceId,
    } = c.req.valid('json');

    // Extract CID from Google Maps URI
    const cid = getCidFromGoogleMapsUri(googleMapsUri);
    if (!cid) { throw new Error('Failed to extract CID from Google Maps URI'); }

    const claims = {} as any
    if (classification) { claims['P1'] = instanceOfItems[classification] }
    if (sect) { claims['P16'] = sectItems[sect] }

    // administrative territory property (P4)
    const p4Values = [] as string[];
    if (administrativeArea) { p4Values.push(administrativeArea) }
    if (locality) { p4Values.push(locality) }
    if (p4Values.length) { claims['P4'] = p4Values }

    if (postalCode) { claims['P15'] = postalCode }
    if (googleMapsPlaceId) { claims['P25'] = googleMapsPlaceId }

    if (googleMapsUri) { claims['P5'] = `https://www.google.com/maps?cid=${cid}` }
    claims['P7'] = 'Q1' // TODO: Think of removing this. Currently we are adding only Places in India, hence this is fine.

    const itemId = await createWikiItem(label, description, claims);
    if (itemId) {
      // Save the itemId in db and also update classification
      updateMapsPlacesStatement.run({ itemId, placeCid: cid, classification });
    }

    return c.json({
      success: true, show: true,
      message: `${itemId} Item created successfully on https://data.jain.wiki`,
      itemId
    });

  });