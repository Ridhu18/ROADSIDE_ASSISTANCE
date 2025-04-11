import locationRoutes from './routes/locationRoutes';
import mechanicRoutes from './routes/mechanicRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/petrol-pump', petrolPumpRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/mechanic', mechanicRoutes); 