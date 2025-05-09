import { Component, Input, forwardRef, HostListener, ElementRef, Renderer2, OnInit, OnDestroy, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, ControlContainer, FormGroupDirective, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() type: string = 'text'; // Nova propriedade de entrada para o tipo do input

  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};
  disabled: boolean = false;
  inputElement: HTMLInputElement | null = null;
  formControl: FormControl | null = null;
  private readonly destroy$ = new Subject<void>();

  // Getter para o tipo do input
  get inputType(): string {
    return this.type;
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private controlContainer: ControlContainer,
    @Optional() private formGroupDirective: FormGroupDirective
  ) {}

  ngOnInit(): void {
    this.inputElement = this.el.nativeElement.querySelector('input');
    if (this.formGroupDirective && this.controlName) {
      this.formControl = this.formGroupDirective.form.get(this.controlName) as FormControl;
      if (this.formControl) {
        this.writeValue(this.formControl.value);
        this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
          this.value = value;
          if (this.inputElement) {
            this.renderer.setProperty(this.inputElement, 'value', value);
          }
        });
      } else {
        console.error(`Não foi possível encontrar o FormControl com o nome '${this.controlName}' no FormGroup.`);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: any): void {
    this.value = value;
    if (this.inputElement) {
      this.renderer.setProperty(this.inputElement, 'value', value);
    }
  }

  registerOnChange = (fn: any) => {
    this.onChange = fn;
  };

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.inputElement) {
      this.renderer.setProperty(this.inputElement, 'disabled', isDisabled);
    }
  }

  handleInput(event: Event) {
    console.log('Input changed:', (event.target as HTMLInputElement)?.value);
    this.value = (event.target as HTMLInputElement)?.value;
    this.onChange(this.value);
    this.onTouched();
    if (this.formControl) {
      this.formControl.setValue(this.value);
    }
  }
}