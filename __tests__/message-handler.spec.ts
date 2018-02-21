import {handler} from '../route'
import {message} from './message'

describe('slack', () => {
  function checkStatusCode(done) {
    return function (_, {statusCode, body}) {
      const ok = statusCode < 300
      expect(statusCode < 300).toBeTruthy()
      done()
    }
  }
  function mockEvent(body) {
    return {body: JSON.stringify(body)}
  }
  it('type message', done => {
    handler(mockEvent(message.message), null, checkStatusCode(done))
  })
  describe(`type message's subtypes`, () => {
    it('subtype file_share', done => {
      handler(mockEvent(message.file_share), null, checkStatusCode(done))
    })
  })
})
