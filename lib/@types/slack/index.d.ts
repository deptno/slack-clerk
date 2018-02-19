declare module '@deptno/slack' {
  type Packet = UrlVerificationPacket|MessagePacket

  interface UrlVerificationPacket {
    type: 'url_verification'
    token: string
    challenge: string
  }
  interface MessagePacket {
    token: string
    team_id: string
    event: MessageEvent
    type: string
    event_id: number
    authed_users: string[]
  }

  type Event = MessageEvent
  interface MessageEvent {
    type: 'message'
    user: string
    text: string
    ts: string
    channel: string
    event_ts: string
  }
}
