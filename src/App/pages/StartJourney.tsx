import React, { Component } from 'react';

import DatabaseDetails from "./DatabaseDetails";
import uploadDbDetails from "./NetworkRequest";

const PACKAGE = "schemaspy";

class StartJourney extends Component {
  constructor(props: any) {
    super(props);
  }

  static sendDbDetails(dbDetails: any) {
    // Tell Lambda function what package to use
    dbDetails.usepackage = PACKAGE;
    uploadDbDetails(JSON.stringify(dbDetails));
  }


  render() {
    return (
      <DatabaseDetails getDbData={StartJourney.sendDbDetails} />
    );
  }
}

export default StartJourney;