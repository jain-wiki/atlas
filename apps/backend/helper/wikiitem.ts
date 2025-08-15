// Ref: https://github.com/maxlath/wikibase-edit/blob/main/docs/how_to.md

// @ts-ignore
import WBEdit from 'wikibase-edit'

const JAIN_WIKI_API_URL = process.env.JAIN_WIKI_API_URL
const JAIN_WIKI_USERNAME = process.env.JAIN_WIKI_USERNAME
const JAIN_WIKI_PASSWORD = process.env.JAIN_WIKI_PASSWORD

if (!JAIN_WIKI_API_URL || !JAIN_WIKI_USERNAME || !JAIN_WIKI_PASSWORD) {
  throw new Error('Missing JAIN_WIKI environment variables')
}

const wbEdit = WBEdit({
  instance: JAIN_WIKI_API_URL,
  credentials: {
    username: JAIN_WIKI_USERNAME,
    password: JAIN_WIKI_PASSWORD,
  },
})

export async function createWikiItem(title: string, description: string, claims: Record<string, string>) {
  const { entity } = await wbEdit.entity.create({
    type: 'item',
    labels: { 'en': title },
    descriptions: { 'en': description },
    claims
  })
  return entity.id
}

export async function editWikiItem(itemId: string, claims: Record<string, string>) {
  const { entity } = await wbEdit.entity.edit({
    id: itemId,
    claims
  })
  return entity.id
}
