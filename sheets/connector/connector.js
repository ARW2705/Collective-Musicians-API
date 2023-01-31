import { sheets } from '@googleapis/sheets'
import { OAuth2Client } from 'google-auth-library'
import SpreadsheetMetadata from '../../models/SpreadsheetMetadata'
import { indexToColAlpha } from '../../shared/index-to-col-alpha'


const connector = new OAuth2Client(
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

async function mapColumns(spreadsheetId) {
  const spreadsheet = await getSpreadSheetMetaData(spreadsheetId)
  let columnsMap = {}
  await Promise.all(spreadsheet.sheets.map(async sheet => {
    const { properties } = sheet
    const { title } = properties
    const colValuesResponse = await getSheetValues(spreadsheetId, `${title}!1:1`)
    let columnMap = {}
    if (!!colValuesResponse.values) {
      const colNames = colValuesResponse.values[0]
      colNames.forEach((colName, index) => {
        if (!!colName) columnMap = { ...columnMap, [colName]: indexToColAlpha(index) }
      })
    }

    columnsMap = { ...columnsMap, [title]: columnMap }
  }))

  await SpreadsheetMetadata.findOneAndUpdate({ spreadsheetId }, { columnsMap }, { upsert: true }).exec()
}

async function getColumnMap(spreadsheetId) {
  const metadata = await SpreadsheetMetadata.findOne({ spreadsheetId }).exec()
  return metadata.columnsMap
}


export {
  getSpreadSheetMetaData,
  getSheetValues,
  mapColumns,
  getColumnMap
}
