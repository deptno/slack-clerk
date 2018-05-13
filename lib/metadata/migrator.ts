import {metadata} from './index'
import {scan} from '../aws/dynamodb-client'
import * as R from 'ramda'

+async function migration() {
  const data = await scan()
  const metaList = R.compose(
    R.bind(Promise.all, Promise as any),
    R.map(metadata),
    R.pluck('url')
  )
  const metas = await metaList(data)
  const insertMeta = R.zipWith((data, meta) => ({ ...data, meta }), data)
  const migrated = insertMeta(metas)
  console.log(migrated)
}()

