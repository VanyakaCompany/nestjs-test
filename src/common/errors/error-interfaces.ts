export interface MongoError {
    code: number;
    keyValue?: Record<string, string>;
}

export interface ValidationErrorConstraint {
    constraints?: Record<string, string>;
}

export type ValidationErrorArray = ValidationErrorConstraint[];
