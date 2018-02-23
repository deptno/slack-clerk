import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda'
import {Event, MessagePacket, NewMessageEvent, UrlVerificationPacket} from '@deptno/slack'
import * as getUrl from 'get-urls'
import {putItem} from '../lib/aws/dynamodb-client'

export const post: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const input = JSON.parse(event.body)
  const handled = route(input)

  console.log(input)
  if (handled !== null) {
    return cb(null, {
      statusCode: 200,
      body      : JSON.stringify(handled),
    })
  }

  console.error('unhandled event', event.body)
  return cb(null, {
    statusCode: 500,
    body      : '',
  })
}

function route(packet) {
  try {
    switch (packet.type) {
      case 'url_verification':
        return handleUrlVerification(packet)
      case 'event_callback':
        return handleEventCallback(packet)
      default:
        return null
    }
  } catch (ex) {
    if (packet.message === 'unknown_event') {
      console.log('unknown_event', packet)

      //warning: infinity loop
      return route({
        ...packet,
        ...packet.event
      })
    }
    return null
  }
}
function handleUrlVerification(event: UrlVerificationPacket) {
  return event.challenge
}

function handleEventCallback(packet: MessagePacket) {
  const {team_id: team, event} = packet
  const {type, channel} = event

  switch (type) {
    case 'message':
      return handleMessage(team, channel, event)
  }
}

function handleMessage(team, channel, event: Event) {
  if ('subtype' in event) {
    if (event.subtype !== 'message_changed') {
      throw new Error('unknown message')
    }
    return handleMessage(team, channel, event.message as any as NewMessageEvent)
  }
  return handleNewMessage(team, channel, event)
}

function handleNewMessage(team, channel, event: NewMessageEvent) {
  const {user, text, ts} = event
  const urls: Set<string> = getUrl(text)

  if (urls.size > 0) {
    //todo: [recommended] It can be replace with batchWrite
    console.log('URL DETECTED', urls)

    urls.forEach(async url => {
      try {
        const timestamp = parseFloat(ts.split('.')[0])
        await putItem({url, user, team, channel, timestamp})
      } catch (ex) {
        console.error(ex)
        console.log('ignored', event)
      }
    })
  }
}
