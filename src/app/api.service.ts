import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gasto } from './gasto.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getGastos(userId: number): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`/api/gastos/${userId}`);
  }

  // Continuación de ApiService

  addGasto(gasto: any) {
    return this.http.post(`/api/gastos`, gasto);
  }

  updateGasto(id: number, gasto: any) {
    return this.http.put(`/api/gastos/${id}`, gasto);
  }

  deleteGasto(id: number) {
    return this.http.delete(`/api/gastos/${id}`);
  }

  getGasto(id: number) {
    return this.http.get(`/api/gastos/${id}`);
  }

}
