import { Component, Input, Output, EventEmitter } from '@angular/core';

export type AlertType = 'question' | 'success' | 'error' | 'warning' | 'info';

@Component({
    selector: 'app-alert',
    imports: [],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.scss'
})
export class AlertComponent {

    @Input() show = false;
    @Input() title = '';
    @Input() message = '¿Estas seguro de eliminar eñ producto %%1?';
    @Input() confirmText = 'Confirmar';
    @Input() cancelText = 'Cancelar';

    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onConfirm() {
        this.confirmed.emit();
        this.show = false;
    }

    onCancel() {
        this.cancelled.emit();
        this.show = false;
    }

}
