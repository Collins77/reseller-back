require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const setupSocket = require('./socket');


console.log(process.env.NODE_ENV);

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());

app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/root'))
app.use('/resellers', require('./routes/resellerRoutes'))
app.use('/categories', require('./routes/categoryRoutes'))
app.use('/faq', require('./routes/faqRoutes'))
app.use('/general', require('./routes/generalRoutes'))
app.use('/info', require('./routes/infoRoutes'))
app.use('/maintenance', require('./routes/maintenanceRoutes'))
app.use('/terms', require('./routes/termRoutes'))
app.use('/admins', require('./routes/adminRoutes'))
app.use('/brands', require('./routes/brandRoutes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/products', require('./routes/productRoutes'))
app.use('/suppliers', require('./routes/supplierRoutes'))
app.use('/ads', require('./routes/adRoutes'))
app.use('/search', require('./routes/searchRoutes'))
app.use("/contacts", require('./routes/contactsRoutes'));
app.use("/messages", require('./routes/messagesRoutes'));
app.use("/channel", require('./routes/channelRoutes'));

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')) {
        res.json({ message: "404 Not Found" })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    setupSocket(app.listen(PORT, () => console.log(`server running on port ${PORT}`)))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log')
})