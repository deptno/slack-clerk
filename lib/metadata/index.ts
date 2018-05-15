import {fetch} from 'metafetch'
import {promisify} from 'util'
import * as R from 'ramda'

const metaFetch = promisify(fetch)
export const metadata: (url: string) => Promise<Metadata> = async (url) => {
  try {
    return extract(await metaFetch(url))
  } catch (ex) {
    return null
  }
}
const metaProps: (keyof Metadata)[] = ['url', 'ampURL', 'image', 'title', 'description', 'language', 'siteName']
const extract = R.ifElse(
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
  R.always(null))

export interface Metadata {
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

