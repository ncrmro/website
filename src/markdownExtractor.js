import yaml from 'yaml'

export default function extractMarkdownMetaData(markdown) {
  const re = new RegExp('^---[\\s\\S]+?---')
  const result = re.exec(markdown)
  const metadata = {}
  if (result) {
    const metadataMatch = result[0]
    for (const item of yaml.parseDocument(metadataMatch).contents.items) {
      const key = item.key.value
      const value = item.value.value
      metadata[key] = value
    }
    markdown = markdown.replace(metadataMatch, '')
  }

  return { markdown, metadata }
}
