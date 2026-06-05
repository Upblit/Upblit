import { getPageMap } from 'nextra/page-map'

const pageMap = await getPageMap()
console.log(JSON.stringify(pageMap, null, 2))
