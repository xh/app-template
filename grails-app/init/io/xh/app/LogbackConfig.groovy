package io.xh.app

/**
 * Apps that do not require custom logging formats must still include this class to properly
 * inherit the base Hoist logging configuration, but with an empty body (no overrides).
 */
class LogbackConfig extends io.xh.hoist.LogbackConfig {
}
