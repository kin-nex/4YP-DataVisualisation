export function uploadDbDetails(dbDetails: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/schemaspyanalysis', {
    method: 'POST',
    mode: 'cors',
    body: dbDetails
  })
}

export function schemaAnalysis(pkg: string, folder: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/schemaanalysis', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      package: pkg,
      folder: folder
    })
  })
}

export function getEntityDetails(dbDetails: { [key: string]: any }, visType: string, ent1: string, pKey1: string,
                                 ent2?: string, pKey2?: string, associativeEntity?: string[]) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/getentitydetails', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      dbDetails: dbDetails,
      visType: visType,
      ent1: ent1,
      pKey1: pKey1,
      ent2: ent2,
      pKey2: pKey2,
      associativeEntity: associativeEntity
    })
  })
}

export function getGraphData(dbDetails: {[key:string]: any}, chartType: string, ent1: string,
                             pKey1: {[key:string]: string}, selectedAtts: any, ent2?: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/getgraphdata', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      dbDetails: dbDetails,
      type: chartType,
      ent1: ent1,
      pKey1: pKey1,
      ent2: ent2,
      attributes: selectedAtts
    })
  })
}

export function reverseGeocode(latlongs: any) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/reversegeocode', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      "coordinates": latlongs
    })
  })
}