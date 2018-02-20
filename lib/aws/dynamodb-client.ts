import {DynamoDB} from 'aws-sdk'

const docClient = process.env.IS_OFFLINE
  ? new DynamoDB.DocumentClient({
    region  : 'ap-northeast-2',
    endpoint: 'http://localhost:8000'
  })
  : new DynamoDB.DocumentClient()

export function putItem<T extends object>(item: T) {
  return new Promise((resolve, reject) => {
    docClient.put({
      TableName: process.env.DYNAMODB_TABLE,
      Item     : item
    }, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}
