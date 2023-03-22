import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Gasto, GastoService } from '../gasto.service';
import { tap } from 'rxjs/operators';
import { SharedService } from '../shared.service';
import { ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gastoService: GastoService,
    private sharedService: SharedService,
    private cd: ChangeDetectorRef
  ) {
    this.userId = authService.getUserId();
    this.gastosForm = this.fb.group({
      date: ['', Validators.required],
      concept: ['', Validators.required],
      category: ['', Validators.required],
      amount: ['', Validators.required]
    });
    this.sharedService.onGastoAdded.subscribe((nuevoGasto) => {
      this.gastos.push(nuevoGasto);
    });
  }

  @ViewChild('editDate') editDate!: ElementRef;
  @ViewChild('editConcept') editConcept!: ElementRef;
  @ViewChild('editCategory') editCategory!: ElementRef;
  @ViewChild('editAmount') editAmount!: ElementRef;

  gastosForm: FormGroup;
  userId: number;
  editIndex: number = -1;
  editedGasto: any = {};
  originalGastos: Gasto[] = [];
  editingGastoId: number | null = null;
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
        this.gastosForm.reset();
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
          this.gastos = [...this.gastos, addedGasto];
          this.originalGastos = [...this.originalGastos, addedGasto];
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

  startEditingGasto(gasto: Gasto): void {
    this.editingGastoId = gasto.id;
  }

  cancelEditingGasto(): void {
    this.editingGastoId = null;
  }

  updateEditedGasto(key: string, value: any): void {
    this.editedGasto[key] = value;
  }

  //toma los datos del formulario, actualiza el gasto y lo guarda en la base de datos y en el array de gastos
  saveEdited(userId: number, gasto: Gasto): void {
    const editedGasto = {
      ...gasto,
      ...this.editedGasto
    };
    this.gastoService.updateGasto(userId, editedGasto).subscribe(
      (updatedGasto) => {
        const index = this.gastos.findIndex((gasto) => gasto.id === updatedGasto.id);
        this.gastos[index] = updatedGasto;
        this.originalGastos[index] = updatedGasto;
        this.editingGastoId = null;
        this.editedGasto = {};
        this.cd.markForCheck();
        this.updateTotalExpensesAmount();
      },
      (error) => {
        console.error('Error al actualizar el gasto:', error);
      }
    );

    this.cancelEdit();
    window.location.reload();
  }






  enableEdit(index: number, gasto: any) {
    this.editIndex = index;
    this.editedGasto = JSON.parse(JSON.stringify(gasto));
  }

  cancelEdit(): void {
    this.editIndex = -1;
    this.editedGasto = {};
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


  private filtrito = ['month', 'category', 'filterByCategoryAndMonth']

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
    console.log(this.gastos);

    this.totalExpensesAmount = this.gastos.reduce((acc, gasto) => {
      console.log(gasto.amount);
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
