export class LoggerService {
    // By default only show error logs
    public loggerMode: 'ERROR' | 'WARN' | 'INFO' = 'ERROR';

    public info<T>(message: T): void {
        if (this.loggerMode === 'INFO') {
            console.log(`[INFO] ${message}`);
        }
    }

    public warn<T>(message: T): void {
        if (this.loggerMode === 'INFO' || this.loggerMode === 'WARN') {
            console.warn(`[WARN] ${message}`);
        }
    }

    public error<T>(message: T): void {
        console.error(`[ERROR] ${message}`);
    }
}

export class Logger {}
