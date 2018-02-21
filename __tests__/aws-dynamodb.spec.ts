import {DynamoDB} from 'aws-sdk'

describe('aws-dynamodb', () => {
  const ddb = new DynamoDB({
    region  : 'localhost',
    endpoint: 'http://localhost:8000'
  })
  let tableName
  it('list tables', async done => {
    ddb.listTables((err, data) => {
      expect(err).toBeNull()
      tableName = data.TableNames[0]
      done()
    })
  })

  it('describe table', async done => {
    console.log('tableName', tableName)
    ddb.describeTable({
      TableName: tableName
    }, (err, data) => {
      expect(err).toBeNull()
      done()
    })
  })
})

describe('aws-dynamodb client', () => {
  const docClient = new DynamoDB.DocumentClient({
    region  : 'localhost',
    endpoint: 'http://localhost:8000'
  })
  it('get', done => {
    docClient.get({
      TableName: 'slack-clerk-dev',
      Key      : {
        id: 'abc'
      }
    }, (err, data) => {
      expect(err).toBeNull()
      done()
    })
  })
})
