import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  authSrv = inject(AuthService);

  formData: FormGroup;
  error: boolean = false;
  message: string = '';
  constructor(private fb: FormBuilder,
    private router: Router,
    private toast: ToastController,
    private loading: LoadingController) { }

  ngOnInit() {
    this.formData = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    console.log(this.formData.value);
  }

  async onLogin() {

    const form = this.formData.value;
    const spinner = await this.loading.create({
      message: 'Verificando...',
      spinner: 'circles',
      showBackdrop: true,
    })

    spinner.present();
    setTimeout(() => {      
      const user = this.authSrv.signIn(form.email, form.password).then(resp => {
        this.alert('Acceso Exitoso', 'success');
        this.loading.dismiss();
        this.router.navigate(['/home']);
      }).catch(err => {
        this.loading.dismiss();
        this.alert('Hubo un error en el ingreso', 'danger')
        this.error = true;
        this.message = "El usuario no existe";
        setTimeout(() => {
          this.message = '';
          this.error = false;
        }, 2000);
      });
    }, 3000);
  }

  onRegister() {
    this.router.navigate(['register']);
  }

  get email() {
    return this.formData.get('email');
  }
  get password() {
    return this.formData.get('password');
  }

  testLogin() {
    this.formData.setValue({ email: 'admin@admin.com', password: '111111' })

  }

  testLogin1() {
    this.formData.setValue({ email: 'invitado@invitado.com', password: '222222' })
  }

  testLogin2() {
    this.formData.setValue({ email: 'usuario@usuario.com', password: '333333' })

  }

  async alert(message, status) {
    try {
      const toast = await this.toast.create({
        icon: 'log-in-outline',
        message: message,
        color: status,
        position: 'middle',
        duration: 1000,
      });
      toast.present();
    } catch (error) {
      console.log(error.message);
    }
  }
}
