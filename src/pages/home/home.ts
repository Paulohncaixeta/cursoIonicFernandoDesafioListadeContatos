import { Component } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import * as _ from 'lodash'
import { EmailComposer } from '@ionic-native/email-composer';
import { AlertController, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public listaContatos : any = []
  public telefone: any = []
  public carregandoContatos: any;
  public email: any;
  public tituloEmail: any;
  public corpoEmail: any;

  constructor(
    public contacts:    Contacts,
    public emailCtrl:   EmailComposer,
    public alertCtrl:   AlertController,
    public toastCtrl:   ToastController,
    public callNumber:  CallNumber,
    public modal:       ModalController,
    public loadingCtrl: LoadingController) {

  }

  ionViewDidLoad() {
    this.getContacts()
  }

  showLoader() {
    this.carregandoContatos = this.loadingCtrl.create({
      content: 'Carregando...'
    });

    this.carregandoContatos.present();
  }

  getContacts() {
    this.showLoader()
    this.contacts.find(
      ["displayName", "phoneNumbers","photos"],
      {multiple: true, hasPhoneNumber: true}).then((contacts) => {
        this.listaContatos = _.sortBy(contacts, ['emails', 'displayName'])
        this.carregandoContatos.dismiss()
    })
  }

  sendMail(user){

    if (user.emails) {
      let alert = this.alertCtrl.create({
        title: 'Prencha os campos:',
        inputs: [
          {
            placeholder: 'Titulo E-mail'
          },
          {
            placeholder: 'Corpo do E-mail'
          }
        ],
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Enviar',
            role: 'send',
            handler: data => {
                this.emailCtrl.open({
                  to: this.filterEmails(user.emails),
                  subject: data[0],
                  body: data[1],
                  isHtml: true
                });
            }
          }
        ]
      });
      alert.present()
    } else {
      this.showMenssagem('Erro: Contato não possui e-mail registrado', 2500)
    }
  }

  filterEmails(emails) {
    let emailsFiltered = []
    emails.forEach(element => {
      emailsFiltered = element.value
    })
    return emailsFiltered
  }

  setContact(telefone){
    let numbers = []
    let inputTypes = []
    telefone.forEach(element => {
      numbers.push(element.value)
    })
    numbers.forEach(element => {
      inputTypes.push({
        type:'radio',
        label: element,
        value: element
      })
    })

  let alert = this.alertCtrl.create({
    title: 'Contatos',
    message: 'Selecione o numero que deseja realiza a ligação',
    inputs : inputTypes,
    buttons : [
      {
        text: "Cancelar"
      },
      {
        text: "Ligar",
        handler: data => {
          this.callNumber.callNumber(data, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
        }
      }
    ]
  })
  alert.present();
}

  showMenssagem(message: string, duration?: number) {
    let menssagem = this.toastCtrl.create({
      message: message,
      duration: duration,
      showCloseButton: true,
      closeButtonText: "Ok"
    });
    menssagem.present();
  }
}
