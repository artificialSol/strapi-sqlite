'use strict';

/**
 * paid service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::paid.paid');
