import { ValidationErrorArray } from './error-interfaces';

export function extractValidationMessages(errors: ValidationErrorArray): string[] {
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}
