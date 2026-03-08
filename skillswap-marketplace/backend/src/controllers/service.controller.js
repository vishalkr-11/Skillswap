// src/controllers/service.controller.js
const serviceService = require('../services/service.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const listServices = asyncHandler(async (req, res) => {
  const result = await serviceService.listServices(req.query);
  sendResponse(res, 200, 'Services fetched', result);
});

const getService = asyncHandler(async (req, res) => {
  const service = await serviceService.getService(req.params.id);
  sendResponse(res, 200, 'Service fetched', { service });
});

const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.user.id, req.body);
  sendResponse(res, 201, 'Service created', { service });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.user.id, req.body);
  sendResponse(res, 200, 'Service updated', { service });
});

const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id, req.user.id);
  sendResponse(res, 200, 'Service deleted');
});

module.exports = { listServices, getService, createService, updateService, deleteService };
