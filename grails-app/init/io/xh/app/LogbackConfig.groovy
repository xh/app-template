package io.xh.app

/**
 * Hook for app-specific logback customizations.
 *
 * The empty subclass is required so the base Hoist logging configuration is picked up under
 * Grails 7+, even when no custom format / converter / appender overrides are needed. Add
 * overrides here as your app's logging needs grow -- see io.xh.hoist.LogbackConfig for the
 * extension points (e.g. monitorLayout, configureLogging).
 */
class LogbackConfig extends io.xh.hoist.LogbackConfig {}
