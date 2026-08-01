import { IsString, MinLength } from 'class-validator';

export class AlterarSenhaDto {

  @IsString()
  @MinLength(6)
  senha_nova: string;
}