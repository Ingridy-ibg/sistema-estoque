import { IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString()
  @MinLength(6)
  senha_nova: string;
}