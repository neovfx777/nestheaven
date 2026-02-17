const complexesService = require('./complexes.service');

async function list(req, res, next) {
  try {
    const result = await complexesService.list(req.validated);
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await complexesService.getById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    console.log('=== Complex Create Request ===');
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Body sample:', JSON.stringify(req.body, null, 2).substring(0, 500));
    console.log('Files:', Object.keys(req.files || {}));
    console.log('Validated:', JSON.stringify(req.validated, null, 2).substring(0, 500));
    console.log('User:', req.user?.id, req.user?.email);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await complexesService.create(req.validated, req.user, baseUrl);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('=== ERROR in complexesController.create ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error meta:', err.meta);
    console.error('Error stack:', err.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Request files:', Object.keys(req.files || {}));
    console.error('Validated data:', JSON.stringify(req.validated, null, 2));
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await complexesService.update(id, req.validated, req.user, baseUrl);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in complexesController.update:', err);
    console.error('Request body:', req.body);
    console.error('Request files:', Object.keys(req.files || {}));
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    await complexesService.remove(id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getForSeller(req, res, next) {
  try {
    const result = await complexesService.getForSeller(req.validated, req.user);
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, getForSeller };
