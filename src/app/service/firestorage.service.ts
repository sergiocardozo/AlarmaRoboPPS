import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  cosasLindasRef: any;
  cosasLindas: Observable<any>;

  cosasFeasRef: any;
  cosasFeas: Observable<any>;

  cosasLindasArray = [];
  cosasFeasArray = [];

  constructor(private firestorage: AngularFireStorage,
    private afs: AngularFirestore) {

    this.cosasLindasRef = this.afs.collection<any>('cosasLindas');
    this.cosasLindas = this.cosasLindasRef.valueChanges({ idField: 'id' });

    this.cosasFeasRef = this.afs.collection<any>('cosasFeas');
    this.cosasFeas = this.cosasFeasRef.valueChanges({ idField: 'id' })
  
    this.getCosasLindas().subscribe((value) => {
      this.cosasLindasArray = value;
    })

    this.getCosasFeas().subscribe((value) => {
      this.cosasFeasArray = value;
    })
  }

  updateImgFirestorage(file: string, data: any) {
    return this.firestorage.upload(file, data);
  }

  addPhoto(photo: any, type: number) {
    if (type == 1) {
      this.cosasLindasRef.add({ ...photo });
    } else if (type == 2) {
      this.cosasFeasRef.add({ ...photo });

    }
  }

  updateImgFirestore(photo: any, id: any, collection: any) {
    return this.afs.collection(collection).doc(id).update(photo);
  }

  refFile(file: string) {
    return this.firestorage.ref(file);
  }

  getCosasLindas() {
    return this.cosasLindas;
  }

  getCosasFeas() {
    return this.cosasFeas;
  }
}
