package io.xh.app


import io.xh.hoist.monitor.provided.DefaultMonitorDefinitionService

/**
 * Example (non)implementation leverages Hoist's built-in status monitor checks
 * Add additional checks as needed by defining more methods on this service of the form:
 *
 *  def myAppCheck(MonitorResult result) {
 *      // Perform check logic here, setting result.status, metric, and/or message as appropriate.
 *  }
 */
class MonitorDefinitionService extends DefaultMonitorDefinitionService {

}
