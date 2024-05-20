import io.xh.hoist.configuration.RuntimeConfig
import io.xh.app.DBConfig

import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig

RuntimeConfig.defaultConfig(this)
DBConfig.dataSourceConfig(this)


//---------------------
// Mail - configures SMTP connection if outbound emailing capabilities required.
//---------------------
grails {
    mail {
        host = getInstanceConfig('smtpHost')
        username = getInstanceConfig('smtpUser')
        password = getInstanceConfig('smtpPassword')
        port = 465
        props = [
            'mail.smtp.auth': 'true',
            'mail.smtp.socketFactory.port': '465',
            'mail.smtp.socketFactory.class': 'javax.net.ssl.SSLSocketFactory',
            'mail.smtp.socketFactory.fallback': 'false'
        ]
    }
}
