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

export function getPotentialGraphs_basicentity(dbDetails: { [key: string]: any }, entity: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/gpg-basicentity', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      dbDetails: dbDetails,
      entity: entity
    })
  })
}