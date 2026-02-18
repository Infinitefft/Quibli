// 搜索建议 DTO

import { 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  IsNumber
} from 'class-validator';

import { Type } from 'class-transformer';

export class PostDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;


  @IsArray()
  @IsNumber({}, { each: true })
  embedding: number[];

  @IsOptional()
  @IsNumber()
  similarity?: number;
}

export class QuestionDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsArray()
  @IsNumber({}, { each: true })
  embedding: number[];

  @IsOptional()
  @IsNumber()
  similarity?: number;
}

export class SearchResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostDto)
  posts: PostDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}