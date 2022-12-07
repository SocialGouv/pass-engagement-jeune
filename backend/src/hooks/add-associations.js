module.exports = function (options = {}) {
  options.models = options.models || [];

  return async (context) => {
    const sequelize = context.params.sequelize || {};
    const include = sequelize.include || [];

    //	Reasign in case we created these properties
    sequelize.include = include.concat(
      options.models.map((model) => {
        const newModel = { ...model, limit: 10 };

        newModel.model = context.app.services[model.model].Model;

        return newModel;
      })
    );

    //	Nested output
    sequelize.raw = false;

    context.params.sequelize = sequelize;
    return context;
  };
};
