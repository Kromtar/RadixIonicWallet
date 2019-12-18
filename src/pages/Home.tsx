import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import {
  Plugins
} from "@capacitor/core";
import React, { Component } from 'react';
var Radix = require('radixdlt');

Radix.radixUniverse.bootstrap(Radix.RadixUniverse.BETANET_EMULATOR);

interface MyState {
  test: string,
  test2: string
}

class Home extends Component<{}, MyState> {

  constructor(props: any){
    super(props);
    this.state = {
      test: "",
      test2: ""
    }
  }

  componentWillMount(){
    const acc = Radix.RadixAccount.fromAddress('9ennxETYQTpvf5CWJZDRcNELmCZc8GjpcVLd27tJ2h7b3xqLQa9')
    acc.openNodeConnection().then(() => {
      acc.isSynced().subscribe((status: any) => {
        if(status){  
          console.log(Object.keys(acc.transferSystem.tokenUnitsBalance)[0]);
          this.setState({test: Object.keys(acc.transferSystem.tokenUnitsBalance)[0]});
        }
      });
    });
    this.scanQrcode().then((res: any) =>{
      this.setState({test2: res});
    })
  }

  async scanQrcode(frontCamera=true, flipCamera=true, torchButton=true) {
    return new Promise((resolve, reject) => {
        Plugins.barcodeScanner.scan(
            (result: any) => {
                resolve(result.text);
            },
            (error: any) => {
                reject(error);
            },
            {
                preferFrontCamera: frontCamera, 
                showFlipCameraButton: flipCamera, 
                showTorchButton: torchButton, 
                torchOn: false, 
                saveHistory: false, 
                prompt: "Place qrcode inside scan area", 
                resultDisplayDuration: 500, 
                formats: "QR_CODE", 
                disableAnimations: true, 
                disableSuccessBeep: false 
            }
        );
    });
}

  render() {
    console.log(Plugins);
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Ionic Blank Fede</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>
            {this.state.test}
            {this.state.test2}
          </p>
        </IonContent>
      </IonPage>
    );
  }
};

export default Home;
