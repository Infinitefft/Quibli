// 搜索建议 DTO

import { 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  IsNumber
} from 'class-validator';

import { Type } from 'class-transformer';

export class SearchPostSuggestionsDto {
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

export class SearchQuestionSuggestionsDto {
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
  @Type(() => SearchPostSuggestionsDto)
  posts: SearchPostSuggestionsDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SearchQuestionSuggestionsDto)
  questions: SearchQuestionSuggestionsDto[];
}