import { DynamoDB } from 'aws-sdk'
import { fetch } from 'metafetch'
import { promisify } from 'util'
import * as R from 'ramda'

const TableName = 'slack-clerk-dev'
const metaFetch = promisify(fetch)

const metadata: (url: string) => Promise<Metadata> = async (url) => {
  try {
    return await metaFetch(url)
  } catch (ex) {
    return null
  }
}
const docClient = new DynamoDB.DocumentClient({ region: 'ap-northeast-2' })

export function batchWrite<T extends object>(items: T[]) {
  if (items.length > 25) {
    throw new Error('length(25) limit violation')
  }
  return new Promise((resolve, reject) => {
    const params = {
      RequestItems: {
        [TableName]: items.map(Item => ({ PutRequest: { Item } }))
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
    docClient.put({ TableName, Item: item }, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}
export function scan(): Promise<Link[]> {
  return new Promise(resolve => {
    docClient.scan({ TableName }, (err, data) => {
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

interface Metadata {
  charset: 'UTF-8' | string
  images: string[]
  links: string[]
  language: 'ko' | string
  uri: {
    scheme: 'https' | string
    userinfo: number | undefined
    host: string
    port: number | undefined,
    path: string
    query: undefined
    fragment: undefined
    reference: 'absolute' | string
  },
  title: string
  description: string
  type: string
  url: string
  originalURL: 'https://aws.amazon.com/ko/blogs/korea/now-available-aws-step-functions-in-seoul-region/',
  ampURL: null
  siteName: string
  image: 'https://d2908q01vomqb2.cloudfront.net/7b52009b64fd0a2a49e6d8a939753077792b0554/2018/05/12/step-functions-seoul-region-1241x630.png',
  meta: {
    viewport: string
    'og:locale': 'ko_KR' | string
    'og:site_name': string
    'og:title': string
    'og:type': 'article' | string,
    'og:url': string
    'og:description': string
    'og:image': string
    'og:image:width': string
    'og:image:height': string
    'og:updated_time': string
    'article:publisher': string
    'article:section': string
    'article:tag': string
    'article:published_time': string
    'article:modified_time': string
    'twitter:card': string
    'twitter:site': string
    'twitter:domain': string
    'twitter:title': string
    'twitter:description': string
    'twitter:image': string
    robots: string
    inlanguage: 'ko-KR' | string
    image: string
  },
  headers: {
    server: string
    date: string
    'content-type': string
    'transfer-encoding': 'chunked' | string
    connection: 'close' | string
    'x-frame-options': 'SAMEORIGIN' | string
    'x-content-type-options': 'nosniff' | string
    'x-amz-id-1': string
    'last-modified': string
    'content-encoding': 'gzip' | string
    vary: string
    'X-UA-Compatible': string
  }
}
interface Link {
  url: string
  user: string
  team: string
  channel: string
  timestamp: number
}
