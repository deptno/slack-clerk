interface Link {
  url: string
  user: string
  team: string
  channel: string
  timestamp: number
  meta?: {
    url: string
    ampURL: string
    image: string
    title: string
    description: string
    language: string
    siteName: string
  }
}
