// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { GastoService, Gasto } from '../gasto.service';
import { Router } from '@angular/router';
import { GastosComponent } from '../gastos/gastos.component';

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

  onSubmit() {
    const id = 0;
    const date = (document.getElementById('fecha') as HTMLInputElement).value;
    const concept = (document.getElementById('concepto') as HTMLInputElement).value;
    const category = (document.getElementById('categoria') as HTMLSelectElement).value;
    const amount = parseFloat((document.getElementById('importe') as HTMLInputElement).value);

    //build an instance of Gasto and send it to the service
    const gasto: Gasto = {
      id: id,
      date: date,
      concept: concept,
      category: category,
      amount: amount,
      user_id: this.authService.getUser()?.id,
    };

    this.gastoService.createGasto(gasto).subscribe(
      (response) => {
        // Gasto agregado correctamente
        console.log('Gasto agregado correctamente');
        // push the new gasto to the array
        this.gastos.push(gasto);

        this.ngOnInit();
      },
      (error) => {
        // Manejar errores aquí
        console.log('Error al agregar el gasto: ', error);
      }
    );


  }



  logout() {
    this.authService.logout();
    // Redireccionar al login
  }
}
