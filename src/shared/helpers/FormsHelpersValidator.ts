/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
export class FormsHelpersValidator {
  static validateDni(form: FormGroup): any {
    const dni = form.controls['dni'];
    const country = form.controls['country'].value;
    if (country === 'CL') {
      const value = dni.value;
      if (!/^[0-9]+-[0-9kK]{1}$/.test(value)) {
        dni.setErrors({ pattern: true });
      } else {
        // Aislar Cuerpo y Dígito Verificador
        const body = value.slice(0, -1).replace('-', '');
        let dv = value.slice(-1).toUpperCase();
        // Calcular Dígito Verificador
        let suma = 0;
        let multiplo = 2;
        // Para cada dígito del Cuerpo
        for (let i = 1; i <= body.length; i++) {
          // Obtener su Producto con el Múltiplo Correspondiente
          const index = multiplo * value.charAt(body.length - i);
          // Sumar al Contador General
          suma = suma + index;
          // Consolidar Múltiplo dentro del rango [2,7]
          if (multiplo < 7) {
            multiplo = multiplo + 1;
          } else {
            multiplo = 2;
          }
        }
        // Calcular Dígito Verificador en base al Módulo 11
        const result = 11 - (suma % 11);
        // Casos Especiales (0 y K)
        dv = dv == 'K' ? 10 : dv;
        dv = dv == 0 ? 11 : dv;
        // Validar que el Cuerpo coincide con su Dígito Verificador
        if (result != dv) {
          dni.setErrors({ pattern: true });
        } else {
          dni.setErrors(null);
        }
      }
    } else {
      dni.setErrors(null);
    }
  }
}
