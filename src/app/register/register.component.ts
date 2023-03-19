import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';




@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    private router: Router) {

    this.registerForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void { }

  register() {
    // Obtiene los valores del formulario
    const id = this.registerForm.value.id;
    const name = this.registerForm.value.name;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    // Implementa la lógica de registro aquí, como llamar a un servicio para enviar los datos al servidor
    this.authService.register(id, name, email, password).subscribe(
      (response) => {
        // Si el registro es exitoso, guarda el mensaje de éxito en el servicio compartido y redirige al login
        this.sharedService.successMessage = 'Registro correcto, acceda con sus credenciales';
        this.router.navigate(['/login']);
      },
      (error) => {
        // Manejar errores aquí
      }
    );;

    console.log('Formulario enviado');
    // notificar al usuario que se ha registrado correctamente
    // redirigir al usuario a la página de inicio de sesión


  }

}
