// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

module.exports = {
    async afterUpdate({result}) {
         if(result.paid) {
             const date = new Date();
             await strapi.db.query("api::paid.paid").create({
               data: {
                 contact: result.contact,
                 accountType: result.accountType,
                 accountNumber:result.accountNumber,
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
          
             await strapi.db.query("api::referral-payment.referral-payment").delete({
                 where: { id: result.id },
               });
           
         }
   
       // do something to the result;
     },
   };
   