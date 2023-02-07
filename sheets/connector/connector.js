import { sheets } from '@googleapis/sheets'
import { auth } from '@googleapis/oauth2'


const connector = new auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET
)

connector.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })


async function getSpreadSheetMetaData(spreadsheetId) {
  const mysheets = sheets('v4')
  return (await mysheets.spreadsheets.get({
    auth: connector,
    spreadsheetId
  })).data
}

async function getSheetValues(spreadsheetId, range) {
  const mysheets = sheets('v4')
  return (await mysheets.spreadsheets.values.get({
    auth: connector,
    spreadsheetId,
    range
  })).data 
}


export {
  getSpreadSheetMetaData,
  getSheetValues
}
