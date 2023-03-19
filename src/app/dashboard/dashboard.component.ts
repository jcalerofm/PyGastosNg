// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { GastoService, Gasto } from '../gasto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  gastos: Gasto[] = [];
  router: any;

  title = 'Mis Gastos';

  constructor(
    private authService: AuthService,
    private gastoService: GastoService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.gastoService.getGastos(user.id).subscribe(gastos => {
        this.gastos = gastos;
      }, error => {
        console.error('Error al obtener gastos:', error);
      });
    } else {
      console.error('No se pudo obtener el ID del usuario.');
    }
  }


  logout() {
    this.authService.logout();
    // Redireccionar al login
  }
}
