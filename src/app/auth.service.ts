import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5001';
  private apiUrl2 = 'http://localhost:5001/api/users';
  private userSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  currentUser: User | null = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  register(id: number, name: string, email: string, password: string): Observable<any> {
    const user = {
      id: id,
      name: name,
      email: email,
      password: password,
    };

    return this.http.post<any>(`${this.apiUrl2}`, user);

  }

  getUserId() {
    const user = this.userSubject.value;
    if (user) {
      return user.id;
    }
    return null;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
  }

  getUser() {
    return this.userSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    console.info('login', email, password)
    return this.http.post<any>(this.apiUrl + '/api/users/login', { email, password });
  }


  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  isLoggedIn() {
    return this.userSubject.value !== null;
  }
}
