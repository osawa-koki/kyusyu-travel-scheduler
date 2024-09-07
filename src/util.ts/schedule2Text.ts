export default function schedule2Text(schedule) {
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
  const title = schedule.properties["名前"].title[0].text.content
  return `📅 ${start} - ${end}\n${title}`
}
