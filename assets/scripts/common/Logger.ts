import { log } from "cc";
import { ISingleton } from "./ISingleton";
import { GlobalCommon } from "./GlobalCommon";

export enum LoggerLevel {
    DEBUG = 0,
    INFO,
    WARN,
    ERROR
}

export class Logger implements ISingleton {
    private static MAXSIZE = 1000
    private static LOGGERLEVEL = LoggerLevel.DEBUG
    private static OUTPUTSIZE = 5

    private static logInfos = []

    Init() {
        this.Clean()
    }
    Update(deltaTime: number) {
        let index = 0
        let outputSize = Logger.logInfos.length >= Logger.OUTPUTSIZE ? Logger.OUTPUTSIZE : Logger.logInfos.length

        while (outputSize >= 1) {
            Logger.printf(Logger.logInfos.shift())
            outputSize--
        }
    }
    Clean() {
        Logger.logInfos.length = 0
        Logger.LOGGERLEVEL = LoggerLevel.DEBUG
    }

    static debug(log, immediately?) {
        if (Logger.LOGGERLEVEL > LoggerLevel.DEBUG) {
            return
        }
        log = "[DEBUG]" + log
        Logger.addLogs(LoggerLevel.DEBUG, log)
    }

    static info(log, immediately?) {
        if (Logger.LOGGERLEVEL > LoggerLevel.INFO) {
            return
        }
        log = "[INFO]" + log
        Logger.addLogs(LoggerLevel.INFO, log)
    }

    static warn(log, immediately?) {
        if (Logger.LOGGERLEVEL > LoggerLevel.WARN) {
            return
        }
        log = "[WARN]" + log
        Logger.addLogs(LoggerLevel.WARN, log)
    }

    static error(log, immediately?) {
        if (Logger.LOGGERLEVEL > LoggerLevel.ERROR) {
            return
        }
        log = "[ERROR]" + log
        Logger.addLogs(LoggerLevel.ERROR, log, immediately)
    }

    private static addLogs(level: LoggerLevel, str: string, immediately?) {
        if (Logger.logInfos.length >= Logger.MAXSIZE) {
            Logger.logInfos.length = 0
        }

        if (!immediately)
            Logger.logInfos.push({ level: level, logString: str })
        else
            Logger.printf({ level: level, logString: str })
    }

    private static printf(logInfo) {
        console.log(logInfo.logString)
    }
}