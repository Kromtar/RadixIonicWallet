import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLabel, IonItem, IonInput, IonFab, IonFabButton, IonImg, IonButton, IonIcon } from '@ionic/react';
import React, { Component } from 'react';
import { Plugins } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { QRCode } from "react-qr-svg";

declare let window: any; // Don't forget this part!

const { Storage } = Plugins;

var { timeout } =  require('rxjs/operators');


var Radix = require('radixdlt');
Radix.radixUniverse.bootstrap(Radix.RadixUniverse.BETANET_EMULATOR);
const token = Radix.radixUniverse.nativeToken;
var idenDecryptGlobal = new Radix.RadixIdentityManager().generateSimpleIdentity();

interface MyState {
  event: string
  balance: string
  password: string 
  identity: any
  addres: string
  photo: string

  sendAddres: string
  sendCantidad: string
  sendMensaje: string

  showFullMenu: string
  showLogIn: string
  showCreateAccount: string
  showPassword:string
  showImage:string
}

class Home extends Component<{}, MyState> {
  constructor(props: any){
    super(props);
    this.state = {
      event: "",
      balance: "0",
      password: "",
      identity: "",
      addres: "",
      photo: '',

      sendAddres: "",
      sendCantidad: "",
      sendMensaje: "",

      showFullMenu:"none",
      showLogIn: "none",
      showCreateAccount: "none",
      showPassword: "block",
      showImage: "none"

    }
    defineCustomElements(window);
  }

  componentWillMount(){
    //this.deleteData();
    this.getWalletData();
  }
  
  render() {
    const { photo } = this.state;
    return (
      <IonPage>

        <div className="ion-text-center">
          <IonHeader>
            <IonToolbar>
              <IonTitle>UAIDEX</IonTitle>
            </IonToolbar>
          </IonHeader>
        </div>

        <IonContent className="ion-padding">
          <div className="ion-text-center">     
            <div style={{ display: this.state.showPassword }}>
              <IonItem>
                <IonLabel position="floating">Password</IonLabel>
                <IonInput clearInput type="password" onInput={(e) => this.updatePass((e.target as HTMLInputElement).value)}></IonInput>
                
              </IonItem>
            </div>

            <div style={{ display: this.state.showLogIn }}>
              <IonButton expand="block" fill="outline" onClick={ () => this.log() } >
                LOG IN
              </IonButton>
              <p>
                {this.state.event}
              </p>

            </div>
            
            <div style={{ display: this.state.showCreateAccount }}>
              <IonButton expand="block" fill="outline" onClick={ () => this.createAccounts() } >
                GENERATE ACC
              </IonButton>
              <p>
                {this.state.event}
              </p>

            </div>

            <div style={{ display: this.state.showFullMenu }}>
              <p>
                {this.state.balance}
              </p>
              <IonButton  fill="outline" onClick={ () => this.deleteData() } >
                BORRAR ACC
              </IonButton>

              <IonButton  fill="outline" onClick={ () => this.getFromFaucet() } >
                GET MONEY
              </IonButton>

              <IonItem>
                <IonLabel position="floating">Cantidad</IonLabel>
                <IonInput clearInput onInput={(e) => this.updateCantidad((e.target as HTMLInputElement).value)}></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Address</IonLabel>
                <IonInput clearInput onInput={(e) => this.updateAddres((e.target as HTMLInputElement).value)}></IonInput>
              </IonItem>

              <IonButton  fill="outline" onClick={ () => this.lunchTransaction() } >
                ENVIAR
              </IonButton>

              <QRCode
                bgColor="#FFFFFF"
                fgColor="#000000"  
                level="Q"
                style={{ width: 256 }}
                value={ "{\"address\":\"" + this.state.addres + "\"}"}
              />

              <p>
                {this.state.event}
              </p>

              <div style={{ display: this.state.showImage }}>
                <IonImg style={{ 'border': '1px solid black', 'minHeight': '100px' }} src={photo} ></IonImg>
              </div>
              <IonFab color="primary" vertical="bottom" horizontal="center" slot="fixed">
                <IonFabButton color="primary" onClick={() => this.getQR()}>
                    <IonIcon name="add" />
                </IonFabButton>
              </IonFab>
            </div>
          </div>
        </IonContent>
        
      </IonPage>
    );
  }

  //boton de actualizacion, pero de momento se actualiza solo ya que se queda con un subscribe
  //<IonButton  fill="outline" onClick={ () => this.getAccInfo() } >
  //GET ACC
  //</IonButton>

  //Se revisa si hay una cuenta creada, si la hay pide password, si no la opcion de crear con una password
  async getWalletData() {
    const iden = await Storage.get({ key: 'IDEN' });

    if(iden.value !== null){
      this.showLogIn();
      this.setState({identity: JSON.parse(String(iden.value))});
      console.log('INICIO');
      console.log(this.state.identity);
    }else{
      this.showCreateAcc();
    }
  }

  //Pide dinero a Faucet, se entregan 10
  async getFromFaucet(){
    try{
      const faucetAddress = '9ecjMNCFDSbLZxVpfbFwFTLWuL7SH3Q49uzGrpK3bUcze6CJtDr';
      const message = 'Dear Faucet, may I please have some money?';
      const faucetAccount = Radix.RadixAccount.fromAddress(faucetAddress, true);
      Radix.RadixTransactionBuilder.createRadixMessageAtom(idenDecryptGlobal.account,faucetAccount, message).signAndSubmit(idenDecryptGlobal);
      idenDecryptGlobal.account.transferSystem.getTokenUnitsBalanceUpdates().subscribe((balance: any) => {
      });
    }catch(err){
      console.log(err);
    }
  }

  //Se envia monedas a tal direccion
  async lunchTransaction(){
    if(parseInt(this.state.sendCantidad) > 0 && parseInt(this.state.sendCantidad) <= parseInt(this.state.balance)){
      const receiverAcc = Radix.RadixAccount.fromAddress(this.state.sendAddres, true);
      await this.openConnectionAndSync(idenDecryptGlobal.account);
      return new Promise((resolve, reject) => {
        const transactionStatus = Radix.RadixTransactionBuilder.createTransferAtom(idenDecryptGlobal.account, receiverAcc, token, this.state.sendCantidad, this.state.sendMensaje).signAndSubmit(idenDecryptGlobal);
        transactionStatus.subscribe({
          next: (status: any) => {console.log(status)},
          complete: () => {
            resolve();
          },
          error: (err: any )=> {
            console.log(err);
            reject(err);
          }
        });
      });
    }else{
      this.setState({event: "Monto a enviar no valido"});
    }
  }

  //Se conecta a hace SYNC con el nodo
  /*openConnectionAndSync(acc: any) {
    return new Promise((resolve, reject) => {
      acc.openNodeConnection().then(() => {
        acc.isSynced().timeout(10000).subscribe(
          (status: any) => {
            console.log(status);
            if(status){  
              resolve(acc);
            }
          },
          (timeoutErr: any) => {
            resolve(acc);
          },
          (end: any) => {}
        );
        //setTimeout(() => resolve(acc),5000);
      })
    });
  }*/

  openConnectionAndSync(account: any) {
    return new Promise((resolve, reject) => {
        account.openNodeConnection().then(() => {
            account.isSynced()
            .pipe(
                timeout(2000)
            )
            .subscribe(
              (            onNext: any) =>{
                console.log(onNext);
            },
              (            onError: any) => {
                console.log(onError);
                if(onError.name == 'TimeoutError'){
                    resolve(account);
                }
            }
            );
        })
    });
  }

  //Se obtienen los datos del codigo QR
  async getQR() {
    let cb = (err:any, code:any) => {
      if (code) {
        this.setState({event: code.data});
        console.log("Found QR code", code);
        var datos = code.data.split("&");
        this.setState({sendMensaje: datos[0]});
        this.setState({sendAddres: datos[1]});
        this.setState({sendCantidad: datos[2]});
      } else {
        console.log(err);
        this.setState({event: "NO CODE"});
      }
      var datos = code.data.split("&");
    }
    let ok = cb.bind(this, null);
    window.cordova.plugins.barcodeScanner.scan(ok, cb, 
      {
        showTorchButton: true,
        prompt: "Scan your code",
        formats: "QR_CODE",
        resultDisplayDuration: 0
      }
    );

  }

  //ID del producto (mensaje)
  //Direccion de pago
  //Cantidad
  //Token
  //&

  async deleteData() {
    await Storage.clear();
    this.setState({password: ""});
    this.setState({identity: ""});
  }

  async createAccounts(){
    if(this.state.password.length >= 6){
      const identityManager = new Radix.RadixIdentityManager();
      const myIdentity = identityManager.generateSimpleIdentity();
      const myAccount = myIdentity.account;
      myAccount.openNodeConnection();
      Radix.RadixKeyStore.encryptKey(myIdentity.address, this.state.password).then((encryptedKey: any) => {
        this.saveData(encryptedKey, myAccount.getAddress(), this.state.password);
      }).catch((error: any) => {
        console.error('Error con la llave de encriptacion', error);
      });
    }else{
      this.setState({event: "Contraseña muy corta"});
    }
  }

  async saveData(iden: any, add: any, pass: any) {
    await Storage.set({
      key: 'IDEN',
      value: JSON.stringify(iden)
    });

    this.setState({event: "Cuenta creada exitosamente"});
  }

  async log() {
    const logedin = await this.decryptKey(this.state.identity, this.state.password);
    if(logedin){
      this.hidePassword();
      this.getAccInfo();
      this.showFullMenu();
      this.hideLogIn();
      this.setState({event: ""});
      this.setState({password: ""});
    }else{
      this.setState({event: "Contraseña incorrecta"});
    }
  }

  async getAccInfo(){
    const acc = Radix.RadixAccount.fromAddress(idenDecryptGlobal.account.getAddress())
    acc.openNodeConnection().then(() => {
      acc.isSynced().subscribe((status: any) => {
        if(status){
          //console.log( String(Object.values(Object(Object.values(acc.transferSystem.tokenUnitsBalance)[0]))[3]) );
          //this.setState({balance: String(Object.values(Object(Object.values(acc.transferSystem.tokenUnitsBalance)[0]))[3])});
          console.log(acc.transferSystem.tokenUnitsBalance[Object.keys(acc.transferSystem.tokenUnitsBalance)[0]].d[0]);
          this.setState({balance: String(acc.transferSystem.tokenUnitsBalance[Object.keys(acc.transferSystem.tokenUnitsBalance)[0]].d[0])});
          console.log("Hubo Sync con RADIX");
          console.log(status);
        }else{
          console.log(acc.transferSystem.tokenUnitsBalance[Object.keys(acc.transferSystem.tokenUnitsBalance)[0]].d[0]);
          this.setState({balance: String(acc.transferSystem.tokenUnitsBalance[Object.keys(acc.transferSystem.tokenUnitsBalance)[0]].d[0])});
          console.log("No hubo Sync con RADIX");
          console.log(status);
        }
      });
    });
  }

  decryptKey(idenEncryp: any, password: string) {
    return new Promise((resolve) => {
      Radix.RadixKeyStore.decryptKey(idenEncryp, password).then((data: any) => {
        idenDecryptGlobal = new Radix.RadixSimpleIdentity(data);
        this.setState({addres: idenDecryptGlobal.account.getAddress()});
        //console.log(idenDecryptGlobal.account.getAddress());
        resolve(true);
      }).catch((error: any) => {
        resolve(false);
      });
    });
  }


  showLogIn(){
    this.setState({showLogIn: "block"});
  }

  hideLogIn(){
    this.setState({showLogIn: "none"});
  }

  showCreateAcc(){
    this.setState({showCreateAccount: "block"});
  }

  hideCreateAcc(){
    this.setState({showCreateAccount: "none"});
  }

  hidePassword(){
    this.setState({showPassword: "none"});
  }

  showFullMenu(){
    this.setState({showFullMenu: "block"});
  }


  updatePass(e:string){
    this.setState({password: e});
  }

  updateCantidad(e:string){
    this.setState({sendCantidad: e});
  }

  updateAddres(e:string){
    this.setState({sendAddres: e});  
  }

};

export default Home;