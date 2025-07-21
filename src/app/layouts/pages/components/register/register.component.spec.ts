import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {RegisterComponent} from './register.component';
import {RegisterService} from '../../services/register.service';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {of} from 'rxjs';

describe('RegisterComponent', () => {
    // Declaración de variables necesarias para las pruebas
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let registerService: jest.Mocked<RegisterService>;
    let router: Router;

    // Datos mock para las pruebas
    // Actualizar los datos mock para asegurar que la fecha de revisión sea exactamente un año después
    const mockProduct = {
        id: 'test123',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'test-logo.png',
        date_release: '2025-09-22',
        date_revision: '2026-09-22'  // Exactamente un año después de date_release
    };

    // Configuración que se ejecuta antes de cada prueba
    beforeEach(() => {
        // Crear mock del servicio con todos sus métodos
        const mockRegisterService = {
            checkIdExists: jest.fn().mockReturnValue(of(false)), // Configurar el mock para retornar un Observable
            setCreateNewProduct: jest.fn(),
            getProductSpecific: jest.fn(),
            setUpdateProduct: jest.fn()
        };

        TestBed.configureTestingModule({
            imports: [
                RegisterComponent,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                FormBuilder,
                { provide: RegisterService, useValue: mockRegisterService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        registerService = TestBed.inject(RegisterService) as jest.Mocked<RegisterService>;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    /** Prueba básica de creación del componente
     * *******************************************
     */
    it('Debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    /** Prueba de inicialización del formulario
     * ******************************************
     */
    /**
    it('Debería inicializar el formulario con campos vacíos', () => {
        expect(component.myForm.get('id')?.value).toBe('');
        expect(component.myForm.get('name')?.value).toBe('');
        expect(component.myForm.get('description')?.value).toBe('');
        expect(component.myForm.get('logo')?.value).toBe('');
        expect(component.myForm.get('date_release')?.value).toBe('');
        expect(component.myForm.get('date_revision')?.value).toBe('');
    });
    */

    it('Debería inicializar el formulario con campos vacíos', () => {
        const formValue = component.myForm.value;

        expect(formValue).toEqual({
            id: '',
            name: '',
            description: '',
            logo: '',
            date_release: '',
            date_revision: ''
        });

        // Verificación adicional opcional
        expect(component.myForm.pristine).toBe(true);
        expect(component.myForm.untouched).toBe(true);
    });

    /** Prueba de validación de campos requeridos
     * ********************************************
     */
    it('Debería validar campos requeridos', (done) => {
        // Configurar el mock para este test específico
        registerService.checkIdExists.mockReturnValue(of(false));

        // Verificar que el formulario sea inválido cuando está vacío
        expect(component.myForm.valid).toBeFalsy();

        // Llenar el formulario con datos válidos
        component.myForm.patchValue(mockProduct);

        // Forzar la validación de todos los campos
        Object.keys(component.myForm.controls).forEach(key => {
            const control = component.myForm.get(key);
            if (control) {
                control.markAsTouched();
                control.markAsDirty();
                control.updateValueAndValidity();
            }
        });

        // Esperar a que se complete la validación asíncrona
        setTimeout(() => {
            fixture.detectChanges();

            // Verificar cada control individualmente
            Object.keys(component.myForm.controls).forEach(key => {
                const control = component.myForm.get(key);
                expect(control?.errors).toBeNull();
            });

            expect(component.myForm.valid).toBeTruthy();
            done();
        }, 100);
    }, 10000); // Aumentar el timeout a 10 segundos


    /** Prueba de validación de ID existente
     * ***************************************
     */
    it('Debería validar si el ID ya existe', (done) => {
        const control = component.myForm.get('id');
        registerService.checkIdExists.mockReturnValue(of(true));

        control?.setValue('test123');

        // Esperar a que se complete la validación asíncrona
        setTimeout(() => {
            expect(registerService.checkIdExists).toHaveBeenCalledWith('test123');
            expect(control?.errors?.['idExists']).toBeTruthy();
            done();
        });
    });

    /** Prueba de validación de fecha de liberación
     * ***********************************************
     */
    it('Debería validar que la fecha de liberación no sea anterior a la actual', () => {
        const control = component.myForm.get('date_release');
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        control?.setValue(pastDate.toISOString().split('T')[0]);
        expect(control?.errors?.['invalidDate']).toBeTruthy();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        control?.setValue(futureDate.toISOString().split('T')[0]);
        expect(control?.errors?.['invalidDate']).toBeFalsy();
    });

    /** Prueba de validación de fecha de revisión
     * ********************************************
     */
    it('Debería validar que la fecha de revisión sea exactamente un año después de la fecha de liberación', () => {
        const releaseControl = component.myForm.get('date_release');
        const revisionControl = component.myForm.get('date_revision');

        const releaseDate = '2024-02-20';
        const correctRevisionDate = '2025-02-20';
        const incorrectRevisionDate = '2025-02-21';

        releaseControl?.setValue(releaseDate);
        revisionControl?.setValue(correctRevisionDate);
        expect(revisionControl?.errors?.['invalidRevisionDate']).toBeFalsy();

        revisionControl?.setValue(incorrectRevisionDate);
        expect(revisionControl?.errors?.['invalidRevisionDate']).toBeTruthy();
    });

    /** Prueba de carga de datos de producto existente
     * *************************************************
     */
    it('Debería cargar los datos del producto cuando se proporciona un ID', () => {
        component.idProduct = 'test123';
        registerService.getProductSpecific.mockReturnValue(of(mockProduct));

        component.ngOnInit();

        expect(registerService.getProductSpecific).toHaveBeenCalledWith('test123');
        expect(component.myForm.get('id')?.value).toBe(mockProduct.id);
        expect(component.myForm.get('name')?.value).toBe(mockProduct.name);
        expect(component.disableBtn).toBeTruthy();
    });

    /** Prueba del método resetForm
     * ******************************
     */
    it('Debería resetear el formulario', () => {
        component.myForm.patchValue(mockProduct);
        component.resetForm();

        expect(component.myForm.get('id')?.value).toBe('');
        expect(component.myForm.get('name')?.value).toBe('');
        expect(component.myForm.get('description')?.value).toBe('');
        expect(component.myForm.get('logo')?.value).toBe('');
        expect(component.myForm.get('date_release')?.value).toBe('');
        expect(component.myForm.get('date_revision')?.value).toBe('');
    });

    /** Prueba de creación de nuevo producto
     * ***************************************
     */
    it('Debería crear un nuevo producto cuando el formulario es válido', () => {
        const navigateSpy = jest.spyOn(router, 'navigate');
        (registerService.setCreateNewProduct as jest.Mock).mockReturnValue(of({ success: true }));

        component.myForm.patchValue(mockProduct);
        component.createNewProduct();

        expect(registerService.setCreateNewProduct).toHaveBeenCalledWith(mockProduct);
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });


    /** Prueba de actualización de producto
     * **************************************
     */
    it('Debería actualizar un producto existente', () => {
        const navigateSpy = jest.spyOn(router, 'navigateByUrl');

        (registerService.setUpdateProduct as jest.Mock).mockReturnValue(of({ message: 'Product updated successfully' }));

        component.idProduct = 'test123';

        component.myForm.patchValue({
            id: 'test123',
            name: 'Test Product',
            description: 'Test Description',
            logo: 'test-logo.png',
            date_release: '2025-09-22',
            date_revision: '2026-09-22'
        });

        component.updateProduct();

        expect(registerService.setUpdateProduct).toHaveBeenCalledWith('test123', {
            id: 'test123',
            name: 'Test Product',
            description: 'Test Description',
            logo: 'test-logo.png',
            date_release: '2025-09-22',
            date_revision: '2026-09-22'
        });

        expect(navigateSpy).toHaveBeenCalledWith('/');
    });
});
