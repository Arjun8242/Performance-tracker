import Joi from 'joi';

const updateAvatar = {
  body: Joi.object().keys({
    avatar: Joi.string().uri().max(1024).allow(null, '').required(),
  }),
};

const updateTheme = {
  body: Joi.object().keys({
    theme: Joi.string().valid('light', 'dark').required(),
  }),
};

const updateNutrition = {
  body: Joi.object().keys({
    nutritionProfile: Joi.object({
      calories: Joi.number().min(0).required(),
      protein: Joi.number().min(0).required(),
    })
      .unknown(true)
      .required(),
  }),
};

export { updateAvatar, updateTheme, updateNutrition };
