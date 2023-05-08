import { Component, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';

import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@awesome-cordova-plugins/device-motion/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  authSrv = inject(AuthService);

  btnPressed: boolean = false;
  activarAlarma: boolean = false;
  password: string;

  acelerationX;
  acelerationY;
  acelerationZ;
  subscription;

  firstAdmission: boolean = true;
  firstAdmissionFlash: boolean = true;

  audioDer = '../../assets/sound/audioDerecha.mp3';
  audioIzq = '../../assets/sound/audioIzquierda.mp3';
  audioHor = '../../assets/sound/audioHorizontal.mp3';
  audioVer = '../../assets/sound/audioVertical.mp3';
  audio = new Audio();

  currentPositionCellPhone = 'actual';
  previousPositionCellPhone = 'anterior';

  constructor(private router: Router,
    private toast: ToastController,
    private flashlight: Flashlight,
    private vibration: Vibration,
    private deviceMotion: DeviceMotion,
    private screenOrientation: ScreenOrientation) {
  }

  logout() {
    this.authSrv.signOut().then((resp) => {
      this.router.navigate(['/login']);
    })
  }

  alarmaActivada() {
    setTimeout(() => {
      this.activarAlarma = true;
      this.alert('Alarma activada', 'success').then(resp => {
        resp.present();
        this.iniciarAlarma();
      })
    }, 2000);
  }

  desactivarAlarma() {
    if (this.password == '123456') {
      setTimeout(() => {
        this.activarAlarma = false;
        this.alert('Alarma desactivada', 'success').then(resp => {
          this.subscription.unsubscribe();
          resp.present();
          this.firstAdmission = true;
          this.password = '';

        })
      }, 2000);
    } else {
      this.alert('Contraseña incorrecta', 'danger').then(resp => {
        resp.present();
        this.moveVertical();
        this.moveHorizontal();

      })
    }
  }

  iniciarAlarma() {
    this.subscription = this.deviceMotion.watchAcceleration({ frequency: 300 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.acelerationX = Math.floor(acceleration.x);
        this.acelerationY = Math.floor(acceleration.y);
        this.acelerationZ = Math.floor(acceleration.z);

        if (acceleration.x > 5) {
          this.currentPositionCellPhone = 'izquierda';
          this.moveLeft();
        } else if (acceleration.x < -5) {
          this.currentPositionCellPhone = 'derecha';
          this.moveRight();
        } else if (acceleration.y >= 9) {
          this.currentPositionCellPhone = 'arriba';

          if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
            this.audio.src = this.audioVer;
            this.previousPositionCellPhone = 'arriba';
          }
          this.audio.play();
          this.moveVertical();
        } else if (acceleration.z >= 9 && acceleration.y >= -1 &&
          acceleration.y <= 1 && acceleration.x >= -1 && acceleration.x <= 1) {
          this.currentPositionCellPhone = 'plano';
          this.moveHorizontal()
        }
      })
  }

  moveLeft() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'izquierda';
      this.audio.src = this.audioIzq;
    }
    this.audio.play();
  } // end of moveLeft

  moveRight() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'derecha';
      this.audio.src = this.audioDer;
    }
    this.audio.play();
  } // end of moveRight

  moveVertical() {
    if (this.firstAdmissionFlash) {
      this.firstAdmissionFlash ? this.flashlight.switchOn() : false;
      setTimeout(() => {
        this.firstAdmissionFlash = false;
        this.flashlight.switchOff();
      }, 5000);
      this.firstAdmission = false;
    }
  } // end of moveVertical

  moveHorizontal() {
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'plano';
      this.audio.src = this.audioHor;
    }

    this.firstAdmission ? null : this.audio.play();
    this.firstAdmission ? null : this.vibration.vibrate(5000);
    this.firstAdmission = true;
    this.firstAdmissionFlash = true;
  } // end of moveHorizontal

  alert(msg: string, status: string) {
    return this.toast.create({
      message: msg,
      position: 'top',
      color: status,
      duration: 2000
    })
  }

}
