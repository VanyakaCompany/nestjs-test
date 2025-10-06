import * as Joi from 'joi';

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    PORT: Joi.number().port().default(3000),
    MONGO_URI: Joi.string().uri().required(),
    API_URI: Joi.string().uri().required(),
    API_INTERVAL: Joi.number().min(1000).default(1000 * 10),
    API_TIMEOUT: Joi.number().min(1000).default(1000 * 60 * 5),
});
