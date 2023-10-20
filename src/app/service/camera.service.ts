import { Injectable } from '@angular/core';

import { getStorage, ref, uploadString } from 'firebase/storage';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FirestorageService } from './firestorage.service';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  user: any = null;

  constructor(private authServ: AuthService,
    private firestorage: AngularFireStorage,
    private firestorageSrv: FirestorageService) {
    this.authServ.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  async addGallery(photo: any, type: number) {
    const capture = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true
    })

    const images = await Camera.pickImages({
      quality: 100,
    })
    const fileStorage = getStorage();
    moment.locale('es');
    const date = moment().format('LLLL');

    photo.hour = date;

    const name = `${this.user.email} ${date}`;
    const storageRef = ref(fileStorage, name);
    const url = this.firestorage.ref(name);

    uploadString(storageRef, capture.dataUrl, 'data_url').then(() => {
      url.getDownloadURL().subscribe((url1) => {
        photo.pathFoto = url1;
        this.firestorageSrv.addPhoto(photo, type);

      })
    })
  }
}
