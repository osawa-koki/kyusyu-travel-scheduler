import { Istest } from './@types/IsTest'
import schedule2Text from './util.ts/schedule2Text'

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

  const now = new Date()
  const datetimeThreshold = new Date(now.getTime() - 60 * 60 * 1000)

  const existingSchedules = results.filter((record) => {
    const properties = record.properties
    const startDatetime = new Date(properties["日付"].date.start)
    return startDatetime > datetimeThreshold
  })

  const sortedSchedules = existingSchedules.sort((a, b) => {
    const startDatetimeA = new Date(a.properties["日付"].date.start)
    const startDatetimeB = new Date(b.properties["日付"].date.start)
    return startDatetimeA.getTime() - startDatetimeB.getTime()
  })

  const slicedSchedules = sortedSchedules.slice(0, 5)

  const message = slicedSchedules.map((schedule) => schedule2Text(schedule)).join("\n\n\n")

  Logger.log(message)

  return out.setContent(JSON.stringify({ isProd, properties }))
}

declare let global: {
  doPost: (e: GoogleAppsScript.Events.DoPost & Istest) => void
}
global.doPost = main

export default main
