import * as joi from "joi";
import { JoiSchema, JoiSchemaOptions } from "nestjs-joi";
import JoiDate from '@joi/date';

const Joi = joi.extend(JoiDate);

@JoiSchemaOptions({
    allowUnknown: false,
})

export class GetFreeRoomsQueryDto {

    @JoiSchema(Joi.date().required())
    date_in: string;

    @JoiSchema(Joi.date().required())
    date_out: string;

}