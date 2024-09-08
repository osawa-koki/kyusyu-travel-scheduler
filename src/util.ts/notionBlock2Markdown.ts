export default function notionBlock2Markdown({ notionSecret, blockId }) {
  const response = UrlFetchApp.fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    "headers": {
      "Authorization": `Bearer ${notionSecret}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    "muteHttpExceptions": true
  })
  const blocks = JSON.parse(response.getContentText()).results
  let numberedListItemCounter = 0
  const markdown = blocks.map((block) => {
    if (block.has_children) {
      return notionBlock2Markdown({ notionSecret, blockId: block.id })
    }
    if (block.type !== 'numbered_list_item') {
      numberedListItemCounter = 0
    }
    switch (block.type) {
      case 'paragraph':
        return block.paragraph.rich_text.map((text) => text.text.content).join('')
      case 'heading_1':
        return `# ${block.heading_1.rich_text.map((text) => text.text.content).join('')}`
      case 'heading_2':
        return `## ${block.heading_2.rich_text.map((text) => text.text.content).join('')}`
      case 'heading_3':
        return `### ${block.heading_3.rich_text.map((text) => text.text.content).join('')}`
      case 'bulleted_list_item':
        return `- ${block.bulleted_list_item.rich_text.map((text) => text.text.content).join('')}`
      case 'numbered_list_item':
        numberedListItemCounter++
        return `${numberedListItemCounter}. ${block.numbered_list_item.rich_text.map((text) => text.text.content).join('')}`
      default:
        return '<マークダウンに変換できないブロックタイプ>'
    }
  }).join('\n')

  return markdown
}
