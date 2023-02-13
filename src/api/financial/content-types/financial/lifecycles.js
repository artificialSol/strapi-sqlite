// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

module.exports = {
    async beforeCreate({ params, state }) {
      //  console.log(params)
      //cole.log(staonste)
      const personal = await strapi.db.query("api::financial.financial").findMany({
        where: {
          email: params.data.email,
        },
      });
      if (personal.length > 0) {
        personal.forEach(async (person) => {
          await strapi.db.query("api::financial.financial").delete({
            where: { id: person.id },
          });
        });
      }
    },
  };
  