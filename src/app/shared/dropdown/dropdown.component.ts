import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { DropdownService } from '../services/dropdown.service';
import { Subscription } from 'rxjs';

export interface DropdownOption {
    value: any;
    label: string;
}

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent implements OnInit, OnDestroy {

    @Input() opciones: string[] = [];
    @Input() dropdownId: string = Math.random().toString(36);
    @Output() cambio = new EventEmitter<string>();

    abierto = false;
    seleccionado = '';
    private subscription?: Subscription;

    constructor(private dropdownService: DropdownService) {}

    ngOnInit() {
        // Escuchar cuando otros dropdowns se abren
        this.subscription = this.dropdownService.cerrarTodos$.subscribe(
            (dropdownId: string) => {
                if (dropdownId !== this.dropdownId) {
                    this.abierto = false; // Cerrar este dropdown
                }
            }
        );
    }

    /**
     * ABRIR - CERRAR
     * --------------
     * Acción que se ejecuta según
     * se abra o cierre el dropdown
     * *******************************
     */
    openClose() {
        if (!this.abierto) {
            // Antes de abrir, cerrar todos los otros
            this.dropdownService.cerrarOtrosDropdowns(this.dropdownId);
        }
        this.abierto = !this.abierto;
    }

    /**
     * SELECCIÓN
     * ---------
     * Cuando el usuario selecciona
     * la acción se emite para ejecución
     * ***********************************
     * @param opcion
     */
    selectOption(opcion: string) {
        this.seleccionado = opcion;
        this.abierto = false;
        this.cambio.emit(opcion);
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
}
