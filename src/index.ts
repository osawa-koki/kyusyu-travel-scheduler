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

  return out.setContent(JSON.stringify({ isProd, properties }))
}

declare let global: {
  doPost: (e: GoogleAppsScript.Events.DoPost & Istest) => void
}
global.doPost = main

export default main
