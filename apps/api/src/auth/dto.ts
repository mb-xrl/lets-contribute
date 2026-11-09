import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  location?: string;
}

export class DemoLoginDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  next?: string;
}
