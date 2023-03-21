import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Gasto, GastoService } from '../gasto.service';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  gastosForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gastoService: GastoService
  ) {
    this.gastosForm = this.fb.group({
      date: ['', Validators.required],
      concept: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  gastos: Gasto[] = [];
  sortColumn: keyof Gasto = 'date';
  sortDirection: 'asc' | 'desc' = 'asc';
  arrayCategoria: string[] = ["Compras", "Ocio", "Hogar", "Transporte", "Otros"];
  filterMonth!: number;
  filterYear!: number;
  filterCategory!: string;
  totalExpensesAmount: number | null = null;
  public selectedFilters: { [key: string]: boolean } = {
    month: false,
    category: false,
    filterByCategoryAndMonth: false,
  };






  ngOnInit(): void {
    this.getGastos();
    this.updateTotalExpensesAmount();
  }

  getGastos() {
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
    this.updateTotalExpensesAmount();

  }

  onHeaderClick(column: keyof Gasto): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortExpenses();
    this.updateTotalExpensesAmount
  }

  sortExpenses(): void {
    this.gastos.sort((a, b) => {
      let aValue: string | number | null | undefined = a[this.sortColumn];
      let bValue: string | number | null | undefined = b[this.sortColumn];

      if (this.sortColumn === 'amount') {
        aValue = parseFloat(aValue?.toString() || '0');
        bValue = parseFloat(bValue?.toString() || '0');
      } else if (this.sortColumn === 'date') {
        aValue = new Date(aValue?.toString() || '').getTime();
        bValue = new Date(bValue?.toString() || '').getTime();
      }

      let comparison = 0;
      if (aValue! > bValue!) {
        comparison = 1;
      } else if (aValue! < bValue!) {
        comparison = -1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }



  toggleFilter(filter: string) {
    this.selectedFilters[filter] = !this.selectedFilters[filter];
  }



  filterByCategoryAndMonthAndYear(category: string, month: number, year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gasto.category === category && gastoDate.getMonth() + 1 === month && gastoDate.getFullYear() === year;
    });
    this.updateTotalExpensesAmount();

  }

  filterByMonthAndYear(month: number, year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gastoDate.getMonth() + 1 === month && gastoDate.getFullYear() === year;
    });
    this.updateTotalExpensesAmount();

  }


  filterByCategoryAndYear(category: string, year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gasto.category === category && gastoDate.getFullYear() === year;
    });

  }

  filterByYear(year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gastoDate.getFullYear() === year;
    });
  }


  filterByMonth(month: number, year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gastoDate.getMonth() + 1 === month && gastoDate.getFullYear() === year;
    });
    this.updateTotalExpensesAmount();

  }

  filterByCategory(category: string): void {
    this.gastos = this.gastos.filter(gasto => gasto.category === category);
    this.updateTotalExpensesAmount();

  }

  filterByCategoryAndMonth(category: string, month: number, year: number): void {
    this.gastos = this.gastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return (
        gasto.category === category &&
        gastoDate.getMonth() + 1 === month &&
        gastoDate.getFullYear() === year
      );
    });
    this.updateTotalExpensesAmount();

  }

  // updateTotalExpensesAmount(): void {
  //   //this method should return the sum of all the expenses amounts
  //   this.totalExpensesAmount = this.gastos.reduce((acc, gasto) => acc + gasto.amount, 0);
  //   console.log(typeof this.totalExpensesAmount);
  // }

  updateTotalExpensesAmount(): void {
    console.log(this.gastos); // Agrega esta línea para ver el contenido del array 'gastos'

    this.totalExpensesAmount = this.gastos.reduce((acc, gasto) => {
      console.log(gasto.amount); // Agrega esta línea para ver los valores que se están sumando
      return acc + (+gasto.amount);
    }, 0);
    console.log(typeof this.totalExpensesAmount);
  }





  clearFilters() {
    for (const key in this.selectedFilters) {
      this.selectedFilters[key] = false;
    }
    this.getGastos();
  }

}
