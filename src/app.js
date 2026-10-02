const express = require('express');
const config = require('./config/config');
const healthRoutes = require('./routes/healthRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes = require('./routes/roleRoutes');
const staffRoutes = require('./routes/staffRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(express.static(config.publicDir));

app.use('/api/health', healthRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/staff', staffRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
