import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        colorize(),           // Colorize log output
        timestamp(),          // Add timestamp to log
        logFormat             // Apply custom format
    ),
    transports: [
        new transports.Console(),  // Log to the console
        new transports.File({ filename: 'app.log' })  // Log to a file named 'app.log'
    ]
});

export default logger;
