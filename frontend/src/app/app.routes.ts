import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MMSETestComponent } from './mmse/mmse-test.component';
import { CNNPredictionComponent } from './cnn/cnn-prediction.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { MedicalRecordsComponent } from './medical-records/medical-records.component';
import { AdminMmseTestsComponent } from './admin/mmse-tests/admin-mmse-tests.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'mmse',
    component: MMSETestComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cnn',
    component: CNNPredictionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/mmse-tests',
    component: AdminMmseTestsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'medical-records',
    component: MedicalRecordsComponent,
    canActivate: [authGuard]
  }
];
