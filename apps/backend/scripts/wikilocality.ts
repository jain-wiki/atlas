import { createWikiItem } from "../helper/wikiitem"

const indianStates: string[] = [
  // TODO: Add data here
]

if (import.meta.main) {
  for (const state of indianStates) {
    const id = await createWikiItem(state, 'State in India', {
      'P1': 'Q43', // Instance of Locality
      'P7': 'Q1', // Country India
    });
    console.log(`Created WikiItem for ${state}: ${id}`);
  }
}
