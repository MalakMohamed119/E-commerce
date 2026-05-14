import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Input() control!: AbstractControl | null;
  @Input() type: string = 'text';
  @Input() id!: string;
  @Input() label!: string;
  @Input() placeholder?: string;

  get showErrors(): boolean {
    const control = this.control as any;
    return !!control && control.touched && control.invalid;
  }

  get errors(): Record<string, any> {
    return this.control?.errors ?? {};
  }
}
