'use strict';

/**
 * next-payment service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::next-payment.next-payment');
