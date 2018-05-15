import {metadata} from '../lib/metadata'

describe('metadata', () => {
  it('type message', async done => {
    const urls = [
      'https://medium.com/@deptno/dynamon-gui-dynamodb-client-2827d60d406f',
      'https://medium.com/@deptno/서평-함수형-자바스크립트-b5d0d3b3395e'
    ]
    const meta = await Promise.all(urls.map(encodeURI).map(metadata))
    meta.forEach(m => {
      expect(m).toHaveProperty('url')
      expect(m).toHaveProperty('url')
    })
    done()
  })
})
