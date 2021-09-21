import * as joi from "joi";
import { JoiSchema, JoiSchemaOptions } from "nestjs-joi";
import JoiDate from '@joi/date';

const Joi = joi.extend(JoiDate);

@JoiSchemaOptions({
    allowUnknown: false,
})

export class CreateReservationDto {

    @JoiSchema(Joi.number().required())
    room_id: number;

    @JoiSchema(Joi.date().required())
    date_in: string;

    @JoiSchema(Joi.date().required())
    date_out: string;

}