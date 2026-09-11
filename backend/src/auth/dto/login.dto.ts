import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

export class DemoDto {
  @IsString()
  @IsOptional()
  role?: string;
}
