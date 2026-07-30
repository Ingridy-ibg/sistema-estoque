import{
    IsInt, 
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';

export class CreateProdutoDto {

    @IsOptional()
    @IsInt()
    @IsPositive()
    categoria_id?: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    nome: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    unidade_medida: string;

    @IsNumber()
    @Min(0)
    quantidade_minima: number;

    @IsNumber()
    @Min(0)
    preco_custo: number;

    @IsNumber()
    @Min(0)
    preco_venda: number;
}
