import { PartialType } from '@nestjs/swagger';

import { CreateBeverageTypeDto } from './create-beverage-type.dto';

export class UpdateBeverageTypeDto extends PartialType(CreateBeverageTypeDto) {}
