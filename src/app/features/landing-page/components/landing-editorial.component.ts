import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-landing-editorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-editorial.component.html',
  styleUrl: './landing-editorial.component.scss',
})
export class LandingEditorialComponent {}
