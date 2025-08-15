// API to get data from Wikibase (https://data.jain.wiki)

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { getDataFromWikibase } from '../helper/wikiquery';

export const wikiQueryRoute = new Hono()



const sparqlLocality = `
SELECT ?item ?itemLabel WHERE {
?item yp:P1 yq:Q43.
SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 100
`
// List of all localities
wikiQueryRoute.get('/locality',
  async (c) => {
    const data = await getDataFromWikibase(sparqlLocality, true)
    // TODO: think of catching this in memory and then serving from there instead of querying Wikibase every time
    return c.json({
      success: true, show: false,
      message: `locality list (P1-Q43)`,
      data: data,
    }, 200, {
      'Cache-Control': 'public, max-age=120' // Caching for 2 minutes
    });
  });


const sparqlTirthankar = `
SELECT ?item ?itemLabel WHERE {
?item yp:P1 yq:Q44.
SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 50
`
// List of all tirthankars
wikiQueryRoute.get('/tirthankar',
  async (c) => {
    const data = await getDataFromWikibase(sparqlTirthankar, true)
    // TODO: think of catching this in memory and then serving from there instead of querying Wikibase every time
    return c.json({
      success: true, show: false,
      message: `tirthankar list (P1-Q44)`,
      data: data,
    }, 200, {
      'Cache-Control': 'public, max-age=120' // Caching for 2 minutes
    });
  });