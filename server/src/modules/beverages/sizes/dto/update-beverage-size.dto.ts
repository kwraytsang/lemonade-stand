import { PartialType } from '@nestjs/swagger';

import { CreateBeverageSizeDto } from './create-beverage-size.dto';

export class UpdateBeverageSizeDto extends PartialType(CreateBeverageSizeDto) {}
