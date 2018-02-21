process.env.DYNAMODB_TABLE = 'slack-clerk-dev'
process.env.IS_OFFLINE = 'true'

import {scan} from '../lib/aws/dynamodb-client'

describe('dynamodb client', () => {
  it('scan', async done => {
    const result = await scan()
    expect(result).toHaveProperty('Items')
    done()
  })
})
