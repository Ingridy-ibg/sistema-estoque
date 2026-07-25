import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';


export class CreateCategoriaDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    nome: string

    @IsOptional()
    @IsString()
    descricao?: string;
}
