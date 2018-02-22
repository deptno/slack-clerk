import {post} from '../route/index'
import {message} from './message'

describe('slack', () => {
  function checkStatusCode(done) {
    return function (_, {statusCode, body}) {
      expect(statusCode < 300).toBeTruthy()
      done()
    }
  }
  function mockEvent(body) {
    return {body: JSON.stringify(body)}
  }
  it('type message', done => {
    post(mockEvent(message.message), null, checkStatusCode(done))
  })
  describe(`type message's subtypes`, () => {
    it('subtype file_share', done => {
      post(mockEvent(message.file_share), null, checkStatusCode(done))
    })
  })
})
