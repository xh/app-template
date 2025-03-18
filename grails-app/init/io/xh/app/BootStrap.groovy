package io.xh.app

import grails.gorm.transactions.Transactional
import io.xh.app.user.AppUser
import io.xh.hoist.config.ConfigService
import io.xh.hoist.log.LogSupport
import io.xh.hoist.pref.PrefService

import static io.xh.hoist.BaseService.parallelInit
import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig
import static io.xh.hoist.util.Utils.*

class BootStrap implements LogSupport {

    ConfigService configService
    PrefService prefService

    def init = {servletContext ->
        logStartupMsg()

        ensureRequiredConfigsCreated()
        ensureRequiredPrefsCreated()
        ensureBootstrapAdminCreated()

        def services = xhServices.findAll {
            it.class.canonicalName.startsWith(this.class.package.name)
        }
        parallelInit(services)
    }

    def destroy = {}


    //------------------------
    // Implementation
    //------------------------
    private void logStartupMsg() {
        def buildLabel = appBuild != 'UNKNOWN' ? " [build $appBuild] " : " "

        logInfo("""
\n
        ------------------------------------------------------------
         ${appName} v${appVersion}${buildLabel}${appEnvironment}
        ------------------------------------------------------------
\n
        """)
    }

    private void ensureRequiredConfigsCreated() {
        String auth0ClientId = getInstanceConfig('auth0ClientId')
        String auth0Domain = getInstanceConfig('auth0Domain')
        String auth0Audience = getInstanceConfig('auth0Audience')

        Map<String, Map> config = new HashMap<>();

        if (auth0ClientId && auth0Domain && auth0Audience) {
            config.put("auth0Config", [
                    auth0Config: [
                            valueType: 'json',
                            defaultValue: [
                                    clientId: auth0ClientId,
                                    domain: auth0Domain
                            ],
                            audience: auth0Audience,
                            clientVisible: false,
                            groupName: 'Auth',
                            note: '@TODO.'
                    ]
            ]);
        }

        configService.ensureRequiredConfigsCreated(config)
    }

    private void ensureRequiredPrefsCreated() {
        prefService.ensureRequiredPrefsCreated([:])
    }

    @Transactional
    private void ensureBootstrapAdminCreated() {
        String adminUsername = getInstanceConfig('bootstrapAdminUser')
        String adminPassword = getInstanceConfig('bootstrapAdminPassword')

        if (adminUsername && adminPassword) {
            def user = AppUser.findByEmail(adminUsername)
            if (!user) {
                new AppUser(
                        email: adminUsername,
                        password: adminPassword,
                        name: 'Bootstrap Admin',
                        profilePicUrl: 'https://xh.io/images/toolbox-admin-profile-pic.png'
                ).save(flush: true)
            } else if (!user.checkPassword(adminPassword)) {
                user.password = adminPassword
                user.save(flush: true)
            }

            logInfo("Local admin user available as per instanceConfig", adminUsername)
        } else {
            logWarn("Default admin user not created. To provide admin access, specify credentials via instance config.")
        }
    }
}
