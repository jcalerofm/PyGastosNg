import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Gasto, GastoService } from '../gasto.service';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  gastosForm: FormGroup;
  userId: number;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gastoService: GastoService
  ) {
    this.userId = authService.getUserId();
    this.gastosForm = this.fb.group({
      date: ['', Validators.required],
      concept: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', Validators.required]
    });
  }

  originalGastos: Gasto[] = [];

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
        this.originalGastos = gastos;
        this.gastos = [...gastos];
        this.updateTotalExpensesAmount();
      }, error => {
        console.error('Error al obtener gastos:', error);
      });
    } else {
      console.error('No se pudo obtener el ID del usuario.');
    }
  }


addGasto() {
  const user = this.authService.getUser();
  if (user && user.id) {
    const newGasto: Gasto = {
      ...this.gastosForm.value,
      user_id: user.id
    };

    this.gastoService.createGasto(newGasto).subscribe(
      (addedGasto) => {
        // Actualiza las listas de gastos y gastos originales
        this.gastos = [...this.gastos, addedGasto];
        this.originalGastos = [...this.originalGastos, addedGasto];
        this.gastos.push(addedGasto);

        // Limpia el formulario y actualiza la cantidad total de gastos
        this.gastosForm.reset();
        this.updateTotalExpensesAmount();
      },
      (error) => {
        console.error('Error al agregar el gasto:', error);
      }
    );
  } else {
    console.error('No se pudo obtener el ID del usuario.');
  }
}


  onHeaderClick(column: keyof Gasto): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortExpenses();
    this.updateTotalExpensesAmount();
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


  private filtrito = ['month', 'category' , 'filterByCategoryAndMonth']

  toggleFilter(filter: string): void {
    // Desactivar todos los filtros excepto el seleccionado
    for (const key of this.filtrito) {
      if (key !== filter) {
        this.selectedFilters[key] = false;
      }
    }
    // Activar o desactivar el filtro seleccionado
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
    this.gastos = this.originalGastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return gastoDate.getMonth() + 1 === month && gastoDate.getFullYear() === year;
    });
    this.updateTotalExpensesAmount();

  }

  filterByCategory(category: string): void {
    this.gastos = this.originalGastos.filter(gasto => gasto.category === category);
    this.updateTotalExpensesAmount();
  }


  filterByCategoryAndMonth(category: string, month: number, year: number): void {
    this.gastos = this.originalGastos.filter(gasto => {
      const gastoDate = new Date(gasto.date);
      return (
        gasto.category === category &&
        gastoDate.getMonth() + 1 === month &&
        gastoDate.getFullYear() === year
      );
    });
    this.updateTotalExpensesAmount();

  }

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

  deleteExpense(gasto: Gasto): void {
    this.gastoService.deleteGasto(this.userId, gasto.id).subscribe(
      () => {
        this.gastos = this.gastos.filter(g => g.id !== gasto.id);
        this.originalGastos = this.originalGastos.filter(g => g.id !== gasto.id);
        this.updateTotalExpensesAmount();
      },
      (error) => {
        console.error('Error al eliminar el gasto:', error);
      }
    );
  }





}
