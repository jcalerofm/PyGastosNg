import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Gasto {
  id: any;
  date: string;
  concept: string;
  category: string;
  amount: number;
  user_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class GastoService {

  private apiUrl = 'http://localhost:5001/api/gastos';


  constructor(private http: HttpClient) { }

  getGastos(userId: number): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}/${userId}`);
  }

  createGasto(gasto: Gasto): Observable<Gasto> {
    console.log('Sending gasto to server:', gasto);
    return this.http.post<Gasto>(`${this.apiUrl}/${gasto.user_id}`, gasto);
  }

  // updateGasto(gasto: Gasto): Observable<Gasto> {
  //   return this.http.put<Gasto>(`${this.apiUrl}/${gasto.id}`, gasto);
  // }

  deleteGasto(userId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/${id}`);
  }



}
