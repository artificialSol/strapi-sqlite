'use strict';

/**
 * financial service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::financial.financial');
