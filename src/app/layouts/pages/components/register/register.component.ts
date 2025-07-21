import {Component, Input, OnInit} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import {RegisterService} from '../../services/register.service';
import {Router, RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-register',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        NgClass
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

    public myForm!: FormGroup;
    public dataProduct: any;
    public formSubmitted = false;
    public disableBtn = false;

    @Input() idProduct!: string;

    constructor(
        private formBuilder: FormBuilder,
        private registerService: RegisterService,
        private router: Router
    ) {
        this.myForm = this.formBuilder.group({
            id: ['', {
                validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10), this.trimValidator()],
                asyncValidators: [this.idExistsValidator()],
                updateOn: 'blur'
            }],
            name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
            logo: ['', Validators.required],
            date_release: ['', [Validators.required, this.dateValidator()]],
            date_revision: ['', [Validators.required]],
        }, { validators: this.dateRangeValidator() });

        /** Suscribirse a los cambios de date_release para forzar la revalidación de date_revision
         * --------------------------------------------------------------------------------------- */
        this.myForm.get('date_release')?.valueChanges.subscribe(() => {
            this.myForm.get('date_revision')?.updateValueAndValidity();
        });
    }

    /**
     * QUITAR ESPACIOS
     * ---------------
     * Quita los espacios del Id
     * del producto que se creará
     * *****************************
     * @private
     */
    private trimValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value) {
                const trimmedValue = control.value.trim();
                if (control.value !== trimmedValue) {
                    control.setValue(trimmedValue, { emitEvent: false });
                }
            }
            return null;
        }
    }

    /**
     * VALIDACIÓN ID
     * -------------
     * Cuando se va a crear un nuevo
     * producto se tiene que validar
     * que no exista el Dd ingresado
     * ********************************
     * @private
     */
    private idExistsValidator() {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            return this.registerService.checkIdExists(control.value).pipe(
                map(exists => exists ? { idExists: true } : null),
                catchError(() => of(null))
            );
        };
    }

    /**
     * VALIDACIÓN FECHA 1
     * ------------------
     * Se realiza la validación de la
     * fecha de liberación que tiene que
     * ser igual o mayor a la fecha actual
     * **************************************
     * @private
     */
    private dateValidator() {
        return (control: any) => {
            // Validar que el control tenga un valor
            if (!control.value) {
                return null; // Permitir valores vacíos (usar required por separado si es necesario)
            }

            // Crear las fechas de forma más segura para evitar problemas de zona horaria
            const inputDate = new Date(control.value + 'T00:00:00');
            const currentDate = new Date();

            // Verificar que la fecha sea válida
            if (isNaN(inputDate.getTime())) {
                return { invalidDate: true };
            }

            /** Establecer las horas, minutos, segundos y
             * milisegundos a 0 para comparar solo las fechas
             * ---------------------------------------------- */
            inputDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            // La fecha debe ser igual o mayor a la fecha actual
            if (inputDate < currentDate) {
                return { invalidDate: true };
            }

            return null; // Fecha válida
        };
    }

    /**
     * Validación para fecha de revisión
     * --------------------------------
     * Verifica que la fecha de revisión sea
     * exactamente un año después de la fecha
     * de liberación
     * ************************************
     */
    private dateRangeValidator(): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
            const dateReleaseControl = group.get('date_release');
            const dateRevisionControl = group.get('date_revision');

            if (!dateReleaseControl || !dateRevisionControl || !dateReleaseControl.value || !dateRevisionControl.value) {
                return null; // Si alguno de los controles no existe o no tiene valor, no validamos aquí
            }

            const releaseDate = new Date(dateReleaseControl.value + 'T00:00:00');
            const revisionDate = new Date(dateRevisionControl.value + 'T00:00:00');

            // Establecer las horas a 0 para comparar solo las fechas
            releaseDate.setHours(0, 0, 0, 0);
            revisionDate.setHours(0, 0, 0, 0);

            // Calcular la fecha esperada (un año después)
            const expectedDate = new Date(releaseDate);
            expectedDate.setFullYear(releaseDate.getFullYear() + 1);

            if (revisionDate.getTime() !== expectedDate.getTime()) {
                dateRevisionControl.setErrors({ invalidRevisionDate: true });
                return { invalidRevisionDate: true };
            } else {
                // Si la validación pasa, asegúrate de limpiar el error si existía
                if (dateRevisionControl.hasError('invalidRevisionDate')) {
                    const errors = dateRevisionControl.errors;
                    if (errors) {
                        delete errors['invalidRevisionDate'];
                        if (Object.keys(errors).length === 0) {
                            dateRevisionControl.setErrors(null);
                        } else {
                            dateRevisionControl.setErrors(errors);
                        }
                    }
                }
            }

            return null;
        };
    }


    ngOnInit() {
        if (this.idProduct) {
            this.myForm.get('id')?.disable();
            this.disableBtn = true;
            this.registerService.getProductSpecific(this.idProduct).subscribe(
                (response: any) => {
                    this.dataProduct = response;
                    if (this.dataProduct) {
                        this.myForm.setValue({
                            id: response.id,
                            name: response.name,
                            description: response.description,
                            logo: response.logo,
                            date_release: response.date_release,
                            date_revision: response.date_revision,
                        });
                        /** Forzar la revalidación de date_revision después de establecer valores
                         * ---------------------------------------------------------------------- */
                        this.myForm.get('date_revision')?.updateValueAndValidity();
                    }
                }
            );
        } else {
            this.disableBtn = false;
        }
    }

    /**
     * LIMPIAR FORMULARIO
     * ------------------
     * Se limpian todos los campos
     * del formulario según acción
     * *****************************
     */
    public resetForm() {
        this.myForm.reset();
        //this.formSubmitted = false;

        // Reiniciar el estado de todos los campos pero mantener las validaciones
        Object.keys(this.myForm.controls).forEach(key => {
            const control = this.myForm.get(key);
            if (control) {
                // Reiniciar el valor pero mantener el estado de validación
                control.setValue('');
                // Marcar como tocado para que se muestren los errores
                control.markAsTouched();
            }
        });
    }

    /**
     * CREAR PRODUCTO
     * --------------
     * Se pasan los datos ingresados
     * por el usuario para crear un
     * nuevo producto según datos
     * ********************************
     */
    public createNewProduct() {
        this.formSubmitted = true;

        if (this.myForm.valid) {
            this.registerService.setCreateNewProduct(this.myForm.value).subscribe({
                next: (response: any) => {
                    this.router.navigate(['/home']);
                },
                error: (error: any) => {
                    console.error('Error al crear el producto:', error);
                }
            });
        }

    }

    /**
     * ACTUALIZAR PRODUCTO
     * -------------------
     * Se valida el formulario
     * y se procede a enviar al servicio
     * los nuevos datos de actualización
     * ***********************************
     */
    public updateProduct() {
        this.formSubmitted = true;

        /** Marcar como tocado para que se muestren los errores
         * ---------------------------------------------------- */
        Object.keys(this.myForm.controls).forEach(key => {
            const control = this.myForm.get(key);
            if (control) {
                control?.markAsTouched({ onlySelf: true });
            }
        });

        if (this.myForm.valid) {
            this.registerService.setUpdateProduct(this.idProduct, this.myForm.value).subscribe(
                (response: any) => {
                    if (response && response.message === "Product updated successfully") {
                        this.router.navigateByUrl('/');
                    }
                }
            );
        }
    }
}
