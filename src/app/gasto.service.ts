import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Gasto {
  id: number;
  userId: number;
  concepto: string;
  importe: number;
  fecha: string;
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
    return this.http.post<Gasto>(this.apiUrl, gasto);
    
  }

  updateGasto(gasto: Gasto): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${gasto.id}`, gasto);
  }

  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
