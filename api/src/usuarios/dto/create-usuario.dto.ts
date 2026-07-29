import {  IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    nome: string;

    @IsEmail()
    @MaxLength(150) 
    email: string;

    @IsString()
    @MinLength(6)
    senha: string;
}