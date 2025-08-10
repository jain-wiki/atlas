import { WBK } from 'wikibase-sdk'

const wbk = WBK({
  instance: 'https://data.jain.wiki',
  sparqlEndpoint: 'https://data.jain.wiki/query/sparql'
})

const sparql = `
PREFIX yq: <https://data.jain.wiki/entity/>
PREFIX yp: <https://data.jain.wiki/prop/direct/>

SELECT *
WHERE
{
 ?s ?p ?o
 OPTIONAL { ?item yp:P2 ?loc }
 SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
}
LIMIT 10

`
const url = wbk.sparqlQuery(sparql)

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Jain-Atlas/1.0'
  }
})

const data = await response.json()

console.log('SPARQL query result:', data)