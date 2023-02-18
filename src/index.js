"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      modules: ["admin::user"],
      afterUpdate: async ({ result }) => {
        const personal = await strapi.db
          .query("api::personal.personal")
          .findMany({
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
        const nextPayments = await strapi.db
          .query("api::next-payment.next-payment")
          .findMany({
            where: {
              users_permissions_user: [result.id],
            },
          });
        const referral = await strapi.db
          .query("api::referral.referral")
          .findMany({
            where: {
              email: [result.referralEmail],
            },
          });

        if (
          personal.length === 0 ||
          financial.length === 0 ||
          !result.approved
        ) {
          //    result.approved = false;
          console.log("entered delete phase")
          nextPayments.forEach(async (payment) => {
            await strapi.db.query("api::next-payment.next-payment").delete({
              where: { id: payment.id },
            });
          });
          return result;
        }
        // If approved
    //    console.log(personal.length, financial.length , result.approved)
        if (personal.length > 0 && financial.length > 0 && result.approved) {
          console.log("approved reached")
          const initialAmount = personal[0].amount;
          const profit = initialAmount * 0.5;
        
          let startDate = new Date();
          let year = startDate.getFullYear();
          let month = startDate.getMonth();
          let day = startDate.getDate();
        
          // Payment every two weeks (total 24 payments including initial investment + profit)
          for (let i = 1; i <= 24; i++) {
            let newMonth = month + 2 * i;
            if (newMonth > 11) {
              newMonth = newMonth - 12;
              year++;
            }
            const amount = i === 24 ? initialAmount + profit : profit;
            await strapi.db.query("api::next-payment.next-payment").create({
              data: {
                contact: result.contact,
                accountType: financial[0].accountType,
                accountNumber: financial[0].accountNumber,
                accountOwner: financial[0].accountOwner,
                bank: financial[0].bank,
                bitcoin: financial[0].bitcoin,
                ethereum: financial[0].ethereum,
                dogecoin: financial[0].dogecoin,
                date: new Date(year, newMonth, day).toISOString(),
                amount: amount,
                users_permissions_user: result.id,
                email: result.email,
              },
            });
          }
console.log("concluded")
          if (referral.length == 1) {
            const percent = 10;
            const amount =
              referral[0].amount === undefined ? 0 : referral[0].amount;
            await strapi.db.query("api::referral.referral").create({
              data: {
                referrals: referral[0].referrals + 1,
                amount:
                  amount + Math.trunc((percent / 100) * personal[0].amount),
                email: result.referralEmail,
                lastPercent: percent,
                lastAdded: Math.trunc((percent / 100) * personal[0].amount),
                users_permissions_user: result.id,
               
              },
            });
          } else {
            await strapi.db.query("api::referral.referral").create({
              data: {
                referrals: 1,
                amount: Math.trunc((10 / 100) * personal[0].amount),
                email: result.referralEmail,
                lastPercent: 10,
                lastAdded: Math.trunc((10 / 100) * personal[0].amount),
                users_permissions_user: result.id,
               
              },
            });
          }
        }
      },
    });
  },
};
