import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    this.authService.login(this.email, this.password).subscribe(user => {
      if (user && user.id) {
        this.authService.setUser(user);
        this.router.navigate(['/dashboard']);
      } else {
        console.error('El objeto de usuario no contiene un ID válido:', user);
      }
    }, error => {
      this.errorMessage = 'Correo electrónico o contraseña incorrectos';
    });
  }

}
