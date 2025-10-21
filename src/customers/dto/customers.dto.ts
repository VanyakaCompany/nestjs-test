import { IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDto {
    @IsNotEmpty({ message: 'ID is required' })
    id: number;

    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be valid' })
    email: string;
}

export class CustomersDto {
    @ValidateNested({ each: true })
    @Type(() => CustomerDto)
    customer: CustomerDto[];
}
