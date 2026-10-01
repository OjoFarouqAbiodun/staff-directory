const path = require('path');
const express = require('express');
const config = require('./config/config');
const healthRoutes = require('./routes/healthRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes = require('./routes/roleRoutes');
const staffRoutes = require('./routes/staffRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Serve the frontend from the public directory
app.use(express.static(path.join(config.publicDir)));

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/staff', staffRoutes);

// Temporary verification route (replaced by the frontend in Phase 3)
app.get('/', (req, res) => {
  res.send('Staff Directory API');
});

// Unmatched routes, then centralized error handling (must be registered last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
