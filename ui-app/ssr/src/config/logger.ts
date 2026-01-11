/**
 * Logger utility for SSR service
 * Writes logs to both console and file system
 *
 * In production (Docker), logs are written to /logs directory
 * which is mounted as a volume for persistence
 */

import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogConfig {
	logDirectory: string;
	logFileName: string;
	maxFileSizeMB: number;
	enableFileLogging: boolean;
	enableConsoleLogging: boolean;
	minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
};

// Default configuration
const config: LogConfig = {
	logDirectory: process.env.LOG_DIRECTORY || '/logs',
	logFileName: `ssr-${process.env.INSTANCE_ID || 'default'}.log`,
	maxFileSizeMB: 50,
	enableFileLogging: process.env.NODE_ENV === 'production',
	enableConsoleLogging: true,
	minLevel: (process.env.LOG_LEVEL as LogLevel) || 'INFO',
};

let logStream: fs.WriteStream | null = null;
let currentLogFile: string = '';

/**
 * Initialize log stream for file-based logging
 */
function initLogStream(): void {
	if (!config.enableFileLogging) {
		console.log(`File logging disabled (NODE_ENV=${process.env.NODE_ENV})`);
		return;
	}

	try {
		// Check if log directory exists
		if (!fs.existsSync(config.logDirectory)) {
			// Try to create the directory
			try {
				fs.mkdirSync(config.logDirectory, { recursive: true });
				console.log(`Created log directory: ${config.logDirectory}`);
			} catch (mkdirError) {
				console.error(`Failed to create log directory ${config.logDirectory}:`, mkdirError);
				config.enableFileLogging = false;
				return;
			}
		}

		// Check if directory is writable
		try {
			fs.accessSync(config.logDirectory, fs.constants.W_OK);
		} catch {
			console.error(`Log directory ${config.logDirectory} is not writable`);
			config.enableFileLogging = false;
			return;
		}

		currentLogFile = path.join(config.logDirectory, config.logFileName);
		logStream = fs.createWriteStream(currentLogFile, { flags: 'a' });

		logStream.on('error', (err) => {
			console.error('Log stream error:', err);
			config.enableFileLogging = false;
		});

		logStream.on('open', () => {
			console.log(`File logging initialized: ${currentLogFile}`);
		});
	} catch (error) {
		console.error('Failed to initialize log stream:', error);
		config.enableFileLogging = false;
	}
}

/**
 * Rotate log file if it exceeds max size
 */
function rotateLogIfNeeded(): void {
	if (!config.enableFileLogging || !currentLogFile) return;

	try {
		const stats = fs.statSync(currentLogFile);
		const fileSizeMB = stats.size / (1024 * 1024);

		if (fileSizeMB >= config.maxFileSizeMB) {
			// Close current stream
			if (logStream) {
				logStream.end();
			}

			// Rename current log file with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const rotatedFile = currentLogFile.replace('.log', `-${timestamp}.log`);
			fs.renameSync(currentLogFile, rotatedFile);

			// Create new log stream
			logStream = fs.createWriteStream(currentLogFile, { flags: 'a' });
		}
	} catch {
		// Ignore rotation errors
	}
}

/**
 * Format log message with timestamp and metadata
 */
function formatMessage(
	level: LogLevel,
	message: string,
	meta?: Record<string, unknown>
): string {
	const timestamp = new Date().toISOString();
	const instanceId = process.env.INSTANCE_ID || 'default';
	const environment = process.env.INSTANCE_ENVIRONMENT || 'Local';

	let formattedMessage = `${timestamp} [${level}] [${environment}/${instanceId}] ${message}`;

	if (meta && Object.keys(meta).length > 0) {
		formattedMessage += ` ${JSON.stringify(meta)}`;
	}

	return formattedMessage;
}

/**
 * Write log message
 */
function writeLog(
	level: LogLevel,
	message: string,
	meta?: Record<string, unknown>
): void {
	// Check minimum log level
	if (LOG_LEVELS[level] < LOG_LEVELS[config.minLevel]) {
		return;
	}

	const formattedMessage = formatMessage(level, message, meta);

	// Console logging
	if (config.enableConsoleLogging) {
		switch (level) {
			case 'ERROR':
				console.error(formattedMessage);
				break;
			case 'WARN':
				console.warn(formattedMessage);
				break;
			case 'DEBUG':
				console.debug(formattedMessage);
				break;
			default:
				console.log(formattedMessage);
		}
	}

	// File logging
	if (config.enableFileLogging && logStream) {
		rotateLogIfNeeded();
		logStream.write(formattedMessage + '\n');
	}
}

// Initialize log stream on module load
initLogStream();

/**
 * Logger interface
 */
export const logger = {
	debug: (message: string, meta?: Record<string, unknown>) =>
		writeLog('DEBUG', message, meta),
	info: (message: string, meta?: Record<string, unknown>) =>
		writeLog('INFO', message, meta),
	warn: (message: string, meta?: Record<string, unknown>) =>
		writeLog('WARN', message, meta),
	error: (message: string, meta?: Record<string, unknown>) =>
		writeLog('ERROR', message, meta),

	/**
	 * Log an error with stack trace
	 */
	errorWithStack: (message: string, error: Error, meta?: Record<string, unknown>) => {
		const errorMeta = {
			...meta,
			errorMessage: error.message,
			stack: error.stack,
		};
		writeLog('ERROR', message, errorMeta);
	},

	/**
	 * Close log stream (for graceful shutdown)
	 */
	close: () => {
		if (logStream) {
			logStream.end();
			logStream = null;
		}
	},
};

export default logger;
