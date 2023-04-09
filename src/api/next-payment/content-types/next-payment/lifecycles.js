// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

module.exports = {
  async afterUpdate({ result }) {
    if (result.paid) {
      const date = new Date();
      await strapi.db.query("api::paid.paid").create({
        data: {
          contact: result.contact,
          accountType: result.accountType,
          accountNumber: result.accountNumber,
          accountOwner: result.accountOwner,
          bank: result.bank,
          bitcoin: result.bitcoin,
          ethereum: result.ethereum,
          dogecoin: result.dogecoin,
          date: date.toISOString(),
          amount: result.amount,
          //  users_permissions_user: result.id
        },
      });

      await strapi.db.query("api::next-payment.next-payment").delete({
        where: { id: result.id },
      });
    }

    const personal = await strapi.db.query("api::personal.personal").findMany({
      where: {
        email: [result.email],
      },
    });
    const financial = await strapi.db
      .query("api::financial.financial")
      .findMany({
        where: {
          email: [result.email],
        },
      });

    if (personal.length > 0 && financial.length > 0 && result.reinvest) {
      console.log("Inside")
      let payments = await strapi.db
        .query("api::next-payment.next-payment")
        .findMany();
      const newAmount = payments[0].amount / (payments.length - 2);

      const initialAmount = personal[0].amount;
      const profit = newAmount + payments[0].amount;
      const dates = [];
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 30);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + payments.length);

      while (currentDate <= endDate) {
        dates.push({ date: currentDate.toISOString(), amount: profit });
        currentDate.setDate(currentDate.getDate() + 30);
      }

      dates[dates.length - 1].amount = initialAmount;
     // console.log(result)
      for (let i = 1; i < dates.length; i++) {
        await strapi.db.query("api::next-payment.next-payment").create({
          data: {
            contact: result.contact,
            accountType: financial[0].accountType,
            accountNumber: financial[0].accountNumber,
            accountOwner: financial[0].accountOwner,
            bank: financial[0].bank,
            bitcoin: financial[0].bitcoin,
            ethereum: financial[0].ethereum || undefined,
            dogecoin: financial[0].dogecoin,
            date: dates[i].date,
            amount: dates[i].amount,
            users_permissions_user: result.users_permissions_user,
            email: result.email,
            reinvest: false
          },
        });
      }
      payments.forEach(async (payment) => {
        await strapi.db.query("api::next-payment.next-payment").delete({
          where: { id: payment.id },
        });
      });
      return result;
    }

    // do something to the result;
  },
  async beforeUpdate({params, data}) {
    // if (data.reinvest) {

    console.log(data)
    console.log(params)
  },
};
