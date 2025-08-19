import { WBK, simplifySparqlResults, } from 'wikibase-sdk'
import axios from 'axios'
import type { SimplifiedSparqlResults, SparqlResults } from 'wikibase-sdk'


export const WikiQuery = WBK({
  instance: 'https://data.jain.wiki',
  sparqlEndpoint: 'https://data.jain.wiki/query/sparql'
})

export const AxWikiQuery = axios.create({
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Jain-Atlas/1.0',
  }
})

const sparqlPrefix = `
PREFIX yq: <https://data.jain.wiki/entity/>
PREFIX yp: <https://data.jain.wiki/prop/direct/>
`

// Function overloads for better type inference
export async function getDataFromWikibase(sparqlQueryString: string, simplify: true): Promise<SimplifiedSparqlResults>
export async function getDataFromWikibase(sparqlQueryString: string, simplify?: false): Promise<SparqlResults>
export async function getDataFromWikibase(sparqlQueryString: string, simplify = false): Promise<SimplifiedSparqlResults | SparqlResults> {
  if (!sparqlQueryString) throw new Error('No SPARQL query provided')
  const sparqlWithPrefix = sparqlPrefix + sparqlQueryString // Add SPARQL prefix
  const url = WikiQuery.sparqlQuery(sparqlWithPrefix) // Construct the SPARQL query URL
  const response = await AxWikiQuery.get(url) // Send the GET request using axios
  if (simplify) { // if simplify is true then simplify the results and return
    return simplifySparqlResults(response.data) as SimplifiedSparqlResults
  }
  return response.data as SparqlResults
}
