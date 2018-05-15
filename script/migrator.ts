import {DynamoDB} from 'aws-sdk'
import {fetch} from 'metafetch'
import {promisify} from 'util'
import * as R from 'ramda'
import {Metadata} from 'lib/metadata'

const TableName = 'slack-clerk-dev'
const metaFetch = promisify(fetch)

const metadata: (url: string) => Promise<Metadata> = async (url) => {
  try {
    return await metaFetch(url)
  } catch (ex) {
    return null
  }
}
const docClient = new DynamoDB.DocumentClient({region: 'ap-northeast-2'})

export function batchWrite<T extends object>(items: T[]) {
  if (items.length > 25) {
    throw new Error('length(25) limit violation')
  }
  return new Promise((resolve, reject) => {
    const params = {
      RequestItems: {
        [TableName]: items.map(Item => ({PutRequest: {Item}}))
      }
    }
    docClient.batchWrite(params, err => {
      if (err) {
        console.error(err)
        console.error(JSON.stringify(params))
        return reject(err)
      }
      return resolve()
    })
  })
}
export function putItem<T extends object>(item: T) {
  return new Promise((resolve, reject) => {
    docClient.put({TableName, Item: item}, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}
export function scan(): Promise<Link[]> {
  return new Promise(resolve => {
    docClient.scan({TableName}, (err, data) => {
      if (err) {
        console.error(err)
        return resolve([])
      }
      return resolve(data.Items as Link[])
    })
  })
}

+async function migration() {
  const data = await scan()
  const metaProps: (keyof Metadata)[] = ['url', 'ampURL', 'image', 'title', 'description', 'language', 'siteName']
  const metaList = R.compose(
    R.bind(Promise.all, Promise as any),
    R.map(metadata),
    R.pluck('url'))
  const schema = R.map(
    R.ifElse(
      R.complement(R.isNil),
      R.compose(
        R.zipObj(metaProps),
        R.map(
          R.ifElse(
            R.isEmpty,
            R.always(' '),
            R.identity)),
        R.values,
        R.pick(metaProps)),
      R.always(null)))
  const meta = schema(await metaList(data))
  const migrated = R.zipWith(
    R.merge,
    data,
    R.map(R.objOf('meta'), meta))

  console.log('sample')
  console.log(R.head(migrated))

  for (const bunch of R.splitEvery(25, migrated)) {
    await batchWrite(bunch)
    console.log('put 25 items')
  }
  console.log('done!')
}()

