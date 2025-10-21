import { MongoError, ValidationErrorArray } from './error-interfaces';

export function isMongoError(err: unknown): err is MongoError {
    return typeof err === 'object' && err !== null && 'code' in err;
}

export function isValidationErrorArray(err: unknown): err is ValidationErrorArray {
    return (
        Array.isArray(err) && err.length > 0 && typeof err[0] === 'object' && err[0] !== null && 'constraints' in err[0]
    );
}
