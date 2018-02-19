import {DynamoDB} from 'aws-sdk'

describe('dynamodb', () => {
  const ddb = new DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  let tableName
  it('list tables', async done => {
    ddb.listTables((err, data) => {
      if (err) {
        fail(err)
      }
      tableName = data.TableNames[0]
      done()
    })
  })

  it('describe table', async done => {
    console.log('tableName', tableName)
    ddb.describeTable({
      TableName: tableName
    }, (err, data) => {
      if (err) {
        fail(err)
      }
      console.log(data)
      done()
    })
  })
})

describe('dynamodb client', () => {
  const docClient = new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
  it('get', done => {
    docClient.get({
      TableName: 'slack-clerk-dev',
      Key: {
        Key: {
          id: 'abc'
        }
      }
    }, (err, data) => {
      if (err) console.log(err);
      else console.log(data);
      done()
    })
  })
})
