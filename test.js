const getService = name => {
    return strapi.plugin('users-permissions').service(name);
  };

// taruh di controller group
// POST /users/bulkregister
// {
//     username
//     name
//     role
//     faculty
//     campus
//     sex
// }
// emailnya semua unknown@gmail.com
async register(ctx) {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    // Throw an error if the password selected by the user
    // contains more than three times the symbol '$'.
    if (getService('user').isHashed(params.password)) {
      throw new ValidationError(
        'Your password cannot contain more than three times the symbol `$`'
      );
    }

    //const roleName dari body
    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }

    params.role = role.id;

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: "unknown@gmail.com" },
    });

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      const user = await getService('user').add(params);

      const sanitizedUser = await sanitizeUser(user, ctx);

      return ctx.send({
        user: sanitizedUser,
      });
    } catch (err) {
      if (_.includes(err.message, 'username')) {
        throw new ApplicationError('Username already taken');
      } else if (_.includes(err.message, 'email')) {
        throw new ApplicationError('Email already taken');
      } else {
        strapi.log.error(err);
        throw new ApplicationError('An error occurred during account creation');
      }
    }
  },