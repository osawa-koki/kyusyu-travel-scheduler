import { Istest } from './@types/IsTest'
import schedule2Text from './util.ts/schedule2Text'
import sendSlackMessage from './util.ts/sendSlackMessage'

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

  const body = JSON.parse(e.postData.contents)

  if (body.type === 'url_verification') {
    const { token: givenToken, challenge: givenChallenge } = body

    const setToken = properties.getProperty('SLACK_VERIFICATION_TOKEN')
    if (givenToken !== setToken) {
      out.setContent(JSON.stringify({
        message: 'Invalid token'
      }))
      return out
    }

    out.setContent(JSON.stringify({
      message: 'Verification',
      challenge: givenChallenge
    }))
    return out
  }


  const notionSecret = properties.getProperty("NOTION_SECRET")!
  const notionDatabaseId = properties.getProperty("NOTION_DATABASE_ID")!

  const notionApiEndpoint = `https://api.notion.com/v1/databases/${notionDatabaseId}/query`

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

  const response = UrlFetchApp.fetch(notionApiEndpoint, options)

  const statusCode = response.getResponseCode()
  if (statusCode !== 200) {
    Logger.log(`Error: ${statusCode} - ${response.getContentText()}`)
    return out.setContent(JSON.stringify({ isProd, message: 'Failed', statusCode, error: response.getContentText() }))
  }

  const jsonResponse = JSON.parse(response.getContentText())

  const results = jsonResponse.results

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

  const commands = body.event.text.split(' ')
  const givenNumber = commands.length >= 2 ? parseInt(commands[1]) : NaN
  const slicingCount = isNaN(givenNumber) ? 5 : givenNumber === 0 ? sortedSchedules.length : givenNumber

  const slicedSchedules = sortedSchedules.slice(0, slicingCount)

  slicedSchedules.forEach((schedule) => {
    Logger.log(JSON.stringify(schedule, null, 2))
  })

  const { notionUsernameSlackIconMapper } = JSON.parse(properties.getProperty("NOTION_USERNAME_SLACK_ICON_MAPPER")!)

  const messageHeader = `🎈🎈🎈 Kyusyu-Travel 🎈🎈🎈`
  const messageBody = slicedSchedules.map((schedule) => {
    return schedule2Text({ schedule, notionSecret, notionUsernameSlackIconMapper })
  }).join("\n")
  const messageFooter = `===== ===== ===== ===== =====`

  const message = [messageHeader, '', messageBody, '', messageFooter].join("\n")

  Logger.log(message)

  const slackIncomingWebhookUrl = properties.getProperty("SLACK_INCOMING_WEBHOOK_URL")!

  if (isProd) {
    const response = sendSlackMessage(slackIncomingWebhookUrl, message)
    Logger.log(response.getContentText())
  }

  return out.setContent(JSON.stringify({ isProd, properties }))
}

declare let global: {
  doPost: (e: GoogleAppsScript.Events.DoPost & Istest) => void
}
global.doPost = main

export default main
