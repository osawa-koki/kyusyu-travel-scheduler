import { Istest } from './@types/IsTest'

const mockEventPostData: GoogleAppsScript.Events.DoPost = {
  postData: {
    contents: JSON.stringify({}),
    length: 0,
    name: 'test',
    type: 'test'
  },
  parameter: {},
  parameters: {},
  queryString: '',
  pathInfo: '',
  contextPath: '',
  contentLength: 0,
}

function main(_e: GoogleAppsScript.Events.DoPost & Istest) {
  const properties = PropertiesService.getScriptProperties()
  const out = ContentService.createTextOutput()
  out.setMimeType(ContentService.MimeType.JSON)

  const e = _e ?? mockEventPostData
  const isProd = e.isTest !== true


  const notionSecret = properties.getProperty("NOTION_SECRET")!
  const notionDatabaseId = properties.getProperty("NOTION_DATABASE_ID")!

  const url = `https://api.notion.com/v1/databases/${notionDatabaseId}/query`

  const headers = {
    "Authorization": `Bearer ${notionSecret}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
  }

  const options = {
    "method": "post",
    "headers": headers,
    "muteHttpExceptions": true
  }

  const response = UrlFetchApp.fetch(url, options)

  const statusCode = response.getResponseCode()
  if (statusCode !== 200) {
    Logger.log(`Error: ${statusCode} - ${response.getContentText()}`)
    return out.setContent(JSON.stringify({ isProd, message: 'Failed', statusCode, error: response.getContentText() }))
  }

  const jsonResponse = JSON.parse(response.getContentText())

  const results = jsonResponse.results
  results.forEach((record) => {
    const properties = record.properties
    Logger.log(JSON.stringify(properties, null, 2))
  })


  return out.setContent(JSON.stringify({ isProd, properties }))
}

declare let global: {
  doPost: (e: GoogleAppsScript.Events.DoPost & Istest) => void
}
global.doPost = main

export default main
