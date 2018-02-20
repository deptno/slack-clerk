declare module '@deptno/slack' {
  type Packet = UrlVerificationPacket | MessagePacket

  interface UrlVerificationPacket {
    type: 'url_verification'
    token: string
    challenge: string
  }
  interface MessagePacket {
    token: string
    team_id: string
    event: Event
    type: string
    event_id: number
    authed_users: string[]
  }

  type Event = NewMessageEvent | MessageChangedEvent
  interface NewMessageEvent extends Message {
    channel: string
    event_ts: string
  }
  interface MessageChangedEvent {
    type: 'message'
    subtype: 'message_changed'
    hidden: boolean
    ts: string
    channel: string
    event_ts: string
    message: EditedMessage
    previous_message: PreviousMessage
  }
  interface Message {
    type: 'message'
    user: string
    text: string
    ts: string
  }
  interface EditedMessage extends Message {
    edited: {
      user: string
      ts: string
    }
  }
  type PreviousMessage = Message
}
