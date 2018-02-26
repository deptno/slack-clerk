import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda'
import {scan} from '../lib/aws/dynamodb-client'

export const get: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const result = await scan()
  const response = {
    statusCode: 200,
    headers: {
      'access-control-allow-origin': '*'
    },
    body      : JSON.stringify(
      result
        .filter(filter)
        .sort(desc)
    ),
  }

  cb(null, response)
}

function desc(p, c) {
  return c.timestamp - p.timestamp
}
function filter({url}: Link) {
  return !blacklist.some(black => url.includes(black))
}

const blacklist = [
  'https://ilbe.com',
  'http://ilbe.com',
  'https://m.vav.kr',
  'http://m.vav.kr',
]
