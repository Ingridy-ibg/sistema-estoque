import{
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString
} from 'class-validator';

export class CreateMovimentacoeDto {

    @IsInt()
    @IsPositive()
    produto_id: number;

    @IsIn(['entrada', 'saida'])
    tipo: string;

    @IsNumber()
    @IsPositive()
    quantidade: number;

    @IsOptional()
    @IsString()
    motivo?: string;
}
