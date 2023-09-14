import { NfzQueuesApiQuery } from '../modules/api-client/interfaces/query.interface';
import { IsInt, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class NfzQueuesQuery implements NfzQueuesApiQuery {
  @IsInt()
  @IsIn([1, 2])
  case: number;

  @IsString()
  @Transform(({ value }: { value: string }) => value.toLocaleLowerCase(), {
    toClassOnly: true,
  })
  @IsIn(['true', 'false'])
  benefitForChildren: string;

  benefit?: string;
  province?: number;
  locality?: string;
}
