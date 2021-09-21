import * as joi from "joi";
import { JoiSchema, JoiSchemaOptions } from "nestjs-joi";
import JoiDate from '@joi/date';

const Joi = joi.extend(JoiDate);

@JoiSchemaOptions({
    allowUnknown: false,
})

export class GetRoomsLoadQueryDto {

    @JoiSchema(Joi.date().required())
    date_from: string;

    @JoiSchema(Joi.date().required())
    date_to: string;

}