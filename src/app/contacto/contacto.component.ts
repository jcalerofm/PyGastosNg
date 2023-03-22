import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {


  nombre!: string;
  email!: string;
  mensaje!: string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  enviarFormularioContacto() {
    const data = {
      nombre: this.nombre,
      email: this.email,
      mensaje: this.mensaje
    };

    this.http.post('http://localhost:5001/api/contacto', data).subscribe(response => {
      console.log(response);
      this.nombre = '';
      this.email = '';
      this.mensaje = '';
      window.alert('Mensaje enviado correctamente.');
    });

  }

}
