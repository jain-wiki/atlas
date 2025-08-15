import { editWikiItem } from '../helper/wikiitem'

const items: string[] = [
  // Todo: add the items here
  // Sample 'Q1'
]

if (import.meta.main) {
  for (const item of items) {
    const resp = await editWikiItem(item, {
      'P1': 'Q44', // Instance of Tirthankar
    });
    console.log(`Updated WikiItem for ${item}: ${resp}`);
  }
}
