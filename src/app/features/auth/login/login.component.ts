import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TriangleAlert,
  Scale,
  Loader2,
} from 'lucide-angular';
import { AuthFacade } from '../../../core/auth/auth.facade';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authFacade = inject(AuthFacade);

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowRight = ArrowRight;
  readonly TriangleAlert = TriangleAlert;
  readonly Scale = Scale;
  readonly Loader2 = Loader2;

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });
  readonly emailControl = this.loginForm.controls.email;
  readonly passwordControl = this.loginForm.controls.senha;
  readonly currentYear = new Date().getFullYear();

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authFacade.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
      },
    });
  }
}
