const _ = require('lodash');
const express = require('express');
const { validateHeader, validateAuth } = require('../middlewares/headers');
const logger = require('../logger');
const cache = require('../services/cache');
const registry = require('../services/registry');

const router = express.Router();

router.post('/:lang_code',
  validateHeader('trust'),
  validateAuth,
  async (req, res) => {
    try {
      const token = req.token.project_token;
      const keys = await registry.find(`cache:${token}:${req.params.lang_code}:*`);
      await Promise.all(_.map(keys, (key) => (async () => {
        const data = await registry.get(key);
        if (data) {
          await registry.del(key);
          if (data.cacheKey) {
            await cache.delContent(data.cacheKey);
          }
        }
      })()));
      const response = {
        status: 'success',
        token,
        count: keys.length,
      };
      res.json({
        data: response,
      });
    } catch (e) {
      logger.error(e);
      const response = {
        status: 'failed',
      };
      res.status(500).json({
        data: response,
      });
    }
  });

router.post('/',
  validateHeader('trust'),
  validateAuth,
  async (req, res) => {
    try {
      const token = req.token.project_token;
      const keys = await registry.find(`cache:${token}:*`);
      await Promise.all(_.map(keys, (key) => (async () => {
        const data = await registry.get(key);
        if (data) {
          await registry.del(key);
          if (data.cacheKey) {
            await cache.delContent(data.cacheKey);
          }
        }
      })()));
      const response = {
        status: 'success',
        token,
        count: keys.length,
      };
      res.json({
        data: response,
      });
    } catch (e) {
      logger.error(e);
      const response = {
        status: 'failed',
      };
      res.status(500).json({
        data: response,
      });
    }
  });

module.exports = router;
