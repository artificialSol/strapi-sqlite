// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

module.exports = {
  async beforeCreate({ params, state }) {
    //  console.log(params)
    //cole.log(staonste)
    const personal = await strapi.db.query("api::personal.personal").findMany({
      where: {
        firstName: params.data.firstName,
      },
    });
    if (personal.length > 0) {
      params.data.amount = personal[0].amount;
      personal.forEach(async (person) => {
        await strapi.db.query("api::personal.personal").delete({
          where: { id: person.id },
        });
      });
    }
  },
};
