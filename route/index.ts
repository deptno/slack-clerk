import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda'
import {Event, NewMessageEvent, UrlVerificationPacket} from '@deptno/slack'
import * as getUrl from 'get-urls'
import {putItem} from '../lib/aws/dynamodb-client'

export const handler: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const input = JSON.parse(event.body)
  const handled = route(input)

  if (handled !== null) {
    return cb(null, {
      statusCode: 200,
      body      : JSON.stringify(handled),
    })
  }

  console.error('unhandled event', event.body)
  return cb(null, {
    statusCode: 500,
    body      : JSON.stringify({
      message: 'unknown event',
      input
    }),
  })
}

function route(packet) {
  try {
    switch (packet.type) {
      case 'url_verification':
        return handleUrlVerification(packet)
      case 'event_callback':
        return handleEventCallback(packet.event)
      default:
        return null
    }
  } catch (ex) {
    if (packet.message === 'unknown_event') {
      //warning: infinity loop
      return route(packet.event)
    }
    return null
  }
}
function handleUrlVerification(event: UrlVerificationPacket) {
  return event.challenge
}

function handleEventCallback(event: Event) {
  switch (event.type) {
    case 'message':
      return handleMessage(event.channel, event)
  }
}

function handleMessage(channel, event: Event) {
  if ('subtype' in event) {
    if (event.subtype !== 'message_changed') {
      throw new Error('unknown message')
    }
    return handleMessage(channel, event.message as any as NewMessageEvent)
  }
  return handleNewMessage(channel, event)
}

function handleNewMessage(channel, event: NewMessageEvent) {
  const {user, text, ts} = event
  const urls: Set<string> = getUrl(event.text)

  if (urls.size > 0) {
    //todo: [recommended] It can be replace with batchWrite
    console.log('URL DETECTED', urls)

    urls.forEach(async url => {
      try {
        const timestamp = parseFloat(ts.split('.')[0])
        await putItem({url, user, channel, timestamp})
      } catch (ex) {
        console.error(ex)
        console.log('ignored', event)
      }
    })
  }
}
