import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

import * as moment from 'moment';
import { Chart, BarElement, BarController, CategoryScale, Decimation, Filler, Legend, Title, Tooltip, LinearScale, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CameraService } from '../service/camera.service';
import { FirestorageService } from '../service/firestorage.service';
import { type } from 'os';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  authSrv = inject(AuthService);
  cameraSrv = inject(CameraService);
  firestorageSrv = inject(FirestorageService);

  user: any = null;
  menu: number = 0;
  pressedButton: boolean = false;
  menuTittle: string = 'COSAS LINDAS';
  cosasLindasList: any = [];
  cosasFeasList: any = [];
  like: boolean = true;
  userImagesCosasLindas: boolean = false;
  userImagesCosasFeas: boolean = false;

  pipeChart: Chart;
  viewPipeChart: boolean;

  constructor(private router: Router,
    private ref: ChangeDetectorRef) {
      Chart.register(
        BarElement,
        BarController,
        CategoryScale,
        Decimation,
        Filler,
        Legend,
        Title,
        Tooltip,
        LinearScale,
        ChartDataLabels
      );

      Chart.register(...registerables);

  }

  ngOnInit(): void {
    this.authSrv.user$.subscribe((user) => {
      if (user) {
        this.user = user;

        this.firestorageSrv.getCosasLindas().subscribe((value) => {
          this.cosasLindasList = value;
          this.cosasLindasList.sort(this.sortList);
          for (let i = 0; i < this.cosasLindasList.length; i++) {
            const photo = this.cosasLindasList[i];            
            
          }
        })

        this.firestorageSrv.getCosasFeas().subscribe((value) => {
          this.cosasFeasList = value;
          this.cosasFeasList.sort(this.sortList);
          for (let i = 0; i < this.cosasFeasList.length; i++) {
            const photo = this.cosasFeasList[i];
            
          }
        });
      }
    })
  }


  doughnutChartMethod() {

    const ctx = (<any>document.getElementById('pipeChart')).getContext('2d');
    console.log(ctx);
    const photos = this.cosasLindasList.filter((p) => p.likes.length > 0);
    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#92949c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const photoColors = photos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    const images = photos.map((p) => {
      const image = new Image(150, 150);
      image.src = p.pathFoto;
      return image;
    });

    this.pipeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: photos.map((p) => p.userName + ' ' + p.hour),

        datasets: [
          {
            label: 'Voto de cosas lindas',
            data: photos.map((p) => p.likes.length),
            backgroundColor: photoColors,
            borderColor: photoColors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#ffffff',
            borderWidth: 3,
            boxHeight: 160,
            boxWidth: 160,
            cornerRadius: 20,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle: (context) => {
                // console.log(context);
                // context.formattedValue = '';
                context.label = 'Votos';
                return {
                  pointStyle: images[context.dataIndex],
                };
              },
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'center',
            font: {
              size: 30,
              weight: 'bold',
            },
            offset: 5,
            backgroundColor: photoColors,
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 10,
            padding: 5,
            textShadowBlur: 10,
            textShadowColor: '#000000',
          },
        },
      },
    })
  }
  sortList(photo1: any, photo2: any) {
    let rtn = 0;
    if (parseInt(photo1.hour) > parseInt(photo2.hour)) {
      rtn = -1;
    } else if (parseInt(photo1.hour) < parseInt(photo2.hour)) {
      rtn = 1;
    }
    return rtn;
  }

  chooseMenu(view: number) {
    this.pressedButton = true;
    if (view === 1) {
      setTimeout(() => {
        this.menu = 1;
        this.menuTittle = 'COSAS LINDAS';
        this.pressedButton = false;
      }, 2000);
    } else if (view === 2) {
      setTimeout(() => {
        this.menu = 2;
        this.menuTittle = 'COSAS FEAS';
        this.pressedButton = false;
      }, 2000);
    } else if (view === 3) {
      setTimeout(() => {
        this.menu = 3;
        this.pressedButton = false;
        setTimeout(() => {
          this.doughnutChartMethod()
        }, 1000);
      }, 2000);
    } else if (view === 4) {
      setTimeout(() => {
        this.menu = 4;
        this.pressedButton = false;
        setTimeout(() => {
          this.generateBarChart();
        }, 1000);
      }, 2000);
    } else {
      setTimeout(() => {
        this.menu = 0;
        this.pressedButton = false;
        this.userImagesCosasLindas = false;
        this.userImagesCosasFeas = false;
      }, 2000);
    }
  }

  addPhotoToGallery() {
    const type = this.menu;
    const photo = {
      userName: this.user.name,
      pathFoto: '',
      email: this.user.email,
      hour: '',
      likes: [],
    };
    console.log(photo);
    this.cameraSrv.addGallery(photo, type).then(() => {
      this.pressedButton = true;
      setTimeout(() => {
        this.pressedButton = false;
      }, 2000);
    });
  }

  voteImage(photo: any, dislike: any) {
    let collection: string;
    if (this.menu == 1) {
      collection = 'cosasLindas';
    } else if (this.menu == 2) {
      collection = 'cosasFeas';
    }

    if (!dislike) {
      photo.likes.push(this.user.email);
    } else {
      photo.likes = photo.likes.filter(
        (like: string) => like != this.user.email
      );
    }


    this.firestorageSrv.updateImgFirestore(photo, photo.id, collection);


  } // end of voteImage

  

  seeOwnImages() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.userImagesCosasLindas = true;
      this.userImagesCosasFeas = true;
    }, 2000);
  } // end of seeOwnImages

  

  generateBarChart() {
    const ctx = (<any>document.getElementById('pipeChart')).getContext('2d');

    const photos = this.cosasFeasList.filter((p) => p.likes.length > 0);
    console.log(photos);
    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#92949c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const photoColors = photos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    const images = photos.map((p) => {
      const image = new Image(150, 150);
      image.src = p.pathFoto;
      return image;
    });

    this.pipeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: photos.map((p) => ''),
        datasets: [
          {
            data: photos.map((p) => p.likes.length),
            backgroundColor: photoColors,
            borderColor: photoColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          y: {
            display: false,
          },
          x: {
            grid: {
              color: '#555555',
              drawOnChartArea: true,
              /* drawBorder: true, */
            },
            ticks: {
              color: 'rgb(0,0,0)',
              font: {
                family: "'Pretendard', sans-serif",
                weight: 'bold',
              },
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#ffffff',
            borderWidth: 3,
            boxHeight: 160,
            boxWidth: 160,
            cornerRadius: 20,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle: (context) => {
                // console.log(context);
                context.formattedValue = 'Votos:' + context.formattedValue;
                context.label = '';
                return {
                  pointStyle: images[context.dataIndex],
                };
              },
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'center',
            font: {
              size: 30,
              weight: 'bold',
            },
            offset: 5,
            backgroundColor: photoColors,
            borderColor: '#ffffff',
            borderWidth: 1,
            borderRadius: 10,
            padding: 5,
            textShadowBlur: 10,
            textShadowColor: '#000000',
          },
        },
      },
    });
  } // end of generateBarChart

  logout() {
    setTimeout(() => {
      this.menu = 0;
      this.userImagesCosasLindas = false;
      this.userImagesCosasFeas = false;
    }, 3000);
    this.authSrv.signOut().then((resp) => {
      this.router.navigate(['/login']);
    })
  }

}
