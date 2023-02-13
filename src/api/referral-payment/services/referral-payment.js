'use strict';

/**
 * referral-payment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::referral-payment.referral-payment');
