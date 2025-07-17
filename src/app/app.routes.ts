import { Routes } from '@angular/router';
import {RegisterComponent} from './layouts/pages/components/register/register.component';
import {HomeComponent} from './layouts/pages/components/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },{
        path: 'home',
        component: HomeComponent
    }, {
        path: 'register/:idProduct',
        component: RegisterComponent
    }, {
       path: 'register',
        component: RegisterComponent
    }, {
        path: '**',
        redirectTo: ''
    }
];
