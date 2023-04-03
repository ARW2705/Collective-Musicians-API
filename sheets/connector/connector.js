import { sheets } from '@googleapis/sheets'
import { auth } from '@googleapis/oauth2'


const connector = new auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET
)

connector.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })


async function getSpreadSheetMetaData(spreadsheetId) {
  const mysheets = sheets('v4')
  const timeStart = Date.now()
  const response = await mysheets.spreadsheets.get({
    auth: connector,
    spreadsheetId
  })
  console.log(`Metadata response time: ${Date.now() - timeStart}ms`)
  return response.data
}

async function getSheetValues(spreadsheetId, range) {
  const mysheets = sheets('v4')
  const timeStart = Date.now()
  const response = await mysheets.spreadsheets.values.get({
    auth: connector,
    spreadsheetId,
    range
  })
  console.log(`Data response time: ${Date.now() - timeStart}ms`)
  return response.data
}


export {
  getSpreadSheetMetaData,
  getSheetValues
}
