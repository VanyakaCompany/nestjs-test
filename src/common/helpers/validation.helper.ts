import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function handleValidationErrors(errors: ValidationError[]) {
  const messages = errors
    .map(err => Object.values(err.constraints || {}))
    .flat();
  throw new BadRequestException(messages);
}