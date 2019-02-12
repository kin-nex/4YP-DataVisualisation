export default function uploadDbDetails(dbDetails: string) {
  alert(dbDetails);
  fetch('https://w4ri4czepi.execute-api.eu-west-2.amazonaws.com/beta/schemaanalysis', {
    method: 'post',
    mode: 'cors',
    body: dbDetails
  }).then(response => {alert(JSON.stringify(response))})
}