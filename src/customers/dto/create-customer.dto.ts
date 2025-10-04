import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty({ message: 'ID is required' })
    id: number;

    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be valid' })
    email: string;
}