import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda'
import {MessagePacket, UrlVerificationPacket, MessageEvent, Event} from '@deptno/slack'
import fetch from 'node-fetch'
import * as getUrl from 'get-urls'

export const handler: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const input = JSON.parse(event.body)
  const handled = route(input)
  console.log(event.body)

  if (handled !== null) {
    return cb(null, {
      statusCode: 200,
      body      : JSON.stringify(handled),
    })
  }

  return cb(null, {
    statusCode: 500,
    body      : JSON.stringify({
      message: 'unknown event',
      input
    }),
  })
}

function route(packet) {
  switch (packet.type) {
    case 'url_verification':
      return handleUrlVerification(packet)
    case 'event_callback':
      return handleEventCallback(packet.event)
    default:
      return null
  }
}
function handleUrlVerification(event: UrlVerificationPacket) {
  console.log('handleUrlVerification(event)', event)
  return event.challenge
}

function handleEventCallback(event: Event) {
  switch (event.type) {
    case 'message':
      return handleMessage(event)
  }
}

function handleMessage(event: MessageEvent) {
  console.log('handleMessage(event)', event)
  console.log(event.channel)
  console.log(event.user)
  console.log(event.text)
  const urls: Set<string> = getUrl(event.text)
  if (urls.size > 0) {

  }
}

function saveUrls(channel, user, urls) {

}

async function getChannelList(token) {
  const response = await fetch(`https://slack.com/api/channels.list?token=${token}`)
  const json = await response.json()
  return json.map(({id, name}) => {
    return {
      id,
      name
    }
  })
}
