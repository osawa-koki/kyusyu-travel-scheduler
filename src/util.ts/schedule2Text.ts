import notionBlock2Markdown from "./notionBlock2Markdown"

export default function schedule2Text({ schedule, notionSecret, notionUsernameSlackIconMapper }) {
  const emoji = schedule.icon.emoji
  const notionUrl = schedule.url

  const startDatetime = new Date(schedule.properties["日付"].date.start)
  const endDatetime = new Date(schedule.properties["日付"].date.end)
  const startYmd = `${startDatetime.getFullYear()}-${(startDatetime.getMonth() + 1).toString().padStart(2, "0")}-${startDatetime.getDate().toString().padStart(2, "0")}`
  const startHour = startDatetime.getHours()
  const startMinute = startDatetime.getMinutes()
  const endYmd = `${endDatetime.getFullYear()}-${(endDatetime.getMonth() + 1).toString().padStart(2, "0")}-${endDatetime.getDate().toString().padStart(2, "0")}`
  const endHour = endDatetime.getHours()
  const endMinute = endDatetime.getMinutes()
  const startYmdText = startYmd.toString()
  const startHourText = startHour.toString().padStart(2, "0")
  const startMinuteText = startMinute.toString().padStart(2, "0")
  const endYmdText = endYmd.toString()
  const endHourText = endHour.toString().padStart(2, "0")
  const endMinuteText = endMinute.toString().padStart(2, "0")
  const isSameDay = startYmd === endYmd
  const start = `${startYmdText} ${startHourText}:${startMinuteText}`
  const end = `${isSameDay ? '' : `${endYmdText} `}${endHourText}:${endMinuteText}`

  const diffHour = (endDatetime.getTime() - startDatetime.getTime()) / 1000 / 60 / 60
  const diffHourText = diffHour.toFixed(1)

  const title = schedule.properties["名前"].title[0]?.text?.content ?? '<タイトル未設定>'
  const place = schedule.properties["場所"].rich_text[0]?.text?.content ?? '<場所未設定>'

  const asignees = schedule.properties["担当者"].people.map((person) => person.name)
  const asigneeIcons = asignees.map(
    (asignee) =>
      `:${notionUsernameSlackIconMapper.find((mapper) => mapper.notionUsername === asignee)?.slackIcon ?? 'question'}:`)
    .sort()
  const asineesText = asignees.length > 0 ? asigneeIcons.join(' ') : '<担当者未設定>'

  const content = notionBlock2Markdown({ notionSecret, blockId: schedule.id })
  const contentText = content.split('\n').map((line) => line.trim() === '' ? null : `\t\t\t\t├ ${line}`).filter((l) => l !== null).join('\n')

  const header = `📅 ${start} - ${end} | ${diffHourText}h`
  let body = ''
  body += `\t\t├ ${emoji} ${title}`
  body += '\n'
  body += `\t\t├ ${asineesText}`
  body += '\n'
  body += `\t\t├ ${place}`
  body += '\n'
  body += `\t\t└ ${notionUrl}`
  body += '\n'
  body += '\t\t\t\t├ ⭐️ 予定詳細 ----- ----- -----'
  body += '\n'
  body += contentText.trim() !== '' ? contentText : '\t\t\t\t├ <予定詳細未設定>'
  body += '\n'
  body += '\t\t\t\t└ ----- ----- ----- ----- ----- -----'
  return `${header}\n${body}`
}
