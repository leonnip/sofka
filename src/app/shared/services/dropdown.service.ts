import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DropdownService {

    private cerrarTodos = new Subject<string>();

    constructor() {
    }

    cerrarTodos$ = this.cerrarTodos.asObservable();

    cerrarOtrosDropdowns(dropdownId: string) {
        this.cerrarTodos.next(dropdownId);
    }
}
