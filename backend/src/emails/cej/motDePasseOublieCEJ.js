module.exports = (mailer) => {
  const templateName = 'motDePasseOublieCEJ';
  const { utils } = mailer;

  let render = (user) => {
    return mailer.render(__dirname, templateName, {
      user,
      link: utils.getUrl(`/inscription/${user.token}`),
    });
  };

  return {
    templateName,
    render,
    send: async (user) => {
      let onSuccess = () => {};

      let onError = async (err) => {
        utils.setSentryError(err);
      };

      return mailer
        .createMailer()
        .sendEmail(user.email, {
          subject:
            'Réinitialisation de votre mot de passe Pass Engagement Jeune',
          body: await render(user),
        })
        .then(onSuccess)
        .catch(onError);
    },
  };
};
