// gasto-form.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-gasto-form',
  templateUrl: './gasto-form.component.html',
  styleUrls: ['./gasto-form.component.css']
})
export class GastoFormComponent {
  fecha = '';
  concepto = '';
  categoria = '';
  importe = '';

  constructor(private authService: AuthService, private apiService: ApiService) { }

  addGasto() {
    const userId = this.authService.getUser().id;
    const gasto = {
      fecha: this.fecha,
      concepto: this.concepto,
      categoria: this.categoria,
      importe: this.importe,
      user_id: userId
    };
    this.apiService.addGasto(gasto).subscribe(() => {
      // Gasto agregado correctamente, actualizar la lista de gastos o redirigir
    }, () => {
      // Mostrar error al agregar gasto
    });
  }
}
