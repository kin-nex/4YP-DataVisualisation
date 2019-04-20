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

export function getPotentialGraphs_basicentity(dbDetails: { [key: string]: any }, entity: string, primaryKey: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/gpg-basicentity', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      dbDetails: dbDetails,
      entity: entity,
      pKey: primaryKey
    })
  })
}

export function getPotentialGraphs_onetomany(dbDetails: { [key: string]: any }, ent1: string, pKey1: string,
                                             ent2: string, pKey2: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/gpg-onetomany', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      dbDetails: dbDetails,
      ent1: ent1,
      pKey1: pKey1,
      ent2: ent2,
      pKey2: pKey2
    })
  })
}