import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda'
import {scan} from '../lib/aws/dynamodb-client'

export const handler: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const result = await scan()
  const response = {
    statusCode: 200,
    body      : JSON.stringify(result),
  }

  cb(null, response)
}
