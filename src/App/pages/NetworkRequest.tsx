export function uploadDbDetails(dbDetails: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/schemaspyanalysis', {
    method: 'POST',
    mode: 'cors',
    body: dbDetails
  })
}

export function schemaAnalysis(folder: string) {
  return fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/schemaanalysis', {
    method: 'POST',
    mode: 'cors',
    body: folder
  })
}