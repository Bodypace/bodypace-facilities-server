import fs from 'node:fs/promises'
import path from 'node:path'
import axios from 'axios'

// TODO:
// should create integration tests that check the schema/swagger of NFZ API server
// againt what we expect and check that the data NFZ server sends actually confirms
// to schema that they provide

async function loadJSON(filename) {
  return JSON.parse(await fs.readFile(filename))
}

class NfzQueuesApiUtils {
  static nfzAddress = 'https://api.nfz.gov.pl'

  static constructFreshUrl(query) {
    let url = `${this.nfzAddress}/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25`
    url += `&case=${query.case}`
    url += `&benefitForChildren=${query.benefitForChildren}`
    if (query.benefit) url += `&benefit=${query.benefit}`
    if (query.province) url += `&province=${String(query.province).padStart(2, '0')}`
    if (query.locality) url += `&locality=${query.locality}`
    return url;
  }

  static constructNextUrl(next) {
    return this.nfzAddress + next
  }
}

async function main() {
  const requestsConfigFilename = 'requests.json'
  const requestsConfig = await loadJSON(requestsConfigFilename)

  const now = new Date()
  let imports = []

  for (const requestName in requestsConfig) {
    try {
      await fs.mkdir(requestName)
    }
    catch (error) {
      console.warn(`could not create a directory for request: ${requestName}, skipping`)
      continue;
    }

    let url = NfzQueuesApiUtils.constructFreshUrl(requestsConfig[requestName])

    console.log('fetching request: ', requestName)
    for (let page = 1; url; ++page) {
      let response;
      try {
        console.log('  page = ', page, ', url = ', url)
        response = await axios.get(url)
      }
      catch (error) {
        console.warn('request failed for url: ', url, { error })
        break
      }

      const data = response.data
      let exportName = `${requestName}_page_${page}`

      try {
        const lines = [
          `// this file was auto-generated at ${now.toISOString()}, do not modify it`,
          "import { NfzQueuesApiResponse } from '../../../../../src/modules/nfz/modules/queues/modules/api-client/interfaces/response.interface';",
          "",
          `export const ${exportName}: NfzQueuesApiResponse =`
        ]
        const fileContent = lines.join('\n') + JSON.stringify(data)
        await fs.writeFile(path.join(requestName, `response-page-${page}.ts`), fileContent)
      }
      catch (error) {
        console.warn('could not save a file')
        break
      }

      imports.push([url, `./${requestName}/response-page-${page}`,exportName])

      const next = data.links.next;
      url = next ? NfzQueuesApiUtils.constructNextUrl(next) : null
    }

    const responsesTsFileContent = []
    responsesTsFileContent.push(`// this file was auto-generated at ${now.toISOString()}, do not modify it`)
    responsesTsFileContent.push("import { NfzQueuesApiResponse } from '../../../../src/modules/nfz/modules/queues/modules/api-client/interfaces/response.interface';")

    for (const [_url, filename, variableName] of imports) {
      responsesTsFileContent.push(
        `import { ${variableName} } from '${filename}';`
      )
    }

    responsesTsFileContent.push('')
    responsesTsFileContent.push('type MockedResponses = {')
    responsesTsFileContent.push('[url: string]: NfzQueuesApiResponse')
    responsesTsFileContent.push('}')
    responsesTsFileContent.push('')
    responsesTsFileContent.push('export const mockedResponses: MockedResponses = {')

    for (const [url, _filename, variableName] of imports) {
      responsesTsFileContent.push(
        `"${url}": ${variableName},`
      )
    }

    responsesTsFileContent.push('}')

    try {
      await fs.writeFile('responses.ts', responsesTsFileContent.join('\n'))
    }
    catch (error) {
      console.error('could not write to responses.ts file')
    }
  }
}

await main()