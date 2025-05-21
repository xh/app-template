package io.xh.app

import grails.gorm.transactions.Transactional
import io.xh.app.security.RoleService
import io.xh.app.security.User
import io.xh.hoist.config.ConfigService
import io.xh.hoist.log.LogSupport
import io.xh.hoist.pref.PrefService

import static io.xh.hoist.BaseService.parallelInit
import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig
import static io.xh.hoist.util.Utils.*

class BootStrap implements LogSupport {

    ConfigService configService
    PrefService prefService
    RoleService roleService

    def init = { servletContext ->
        logStartupMsg()

        ensureRequiredConfigsCreated()
        ensureRequiredPrefsCreated()
        ensureRequiredRolesCreated()

        createLocalAdminUserIfNeeded()

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
        configService.ensureRequiredConfigsCreated([
                auth0Config: [
                        groupName    : 'Security',
                        valueType    : 'json',
                        defaultValue : [
                                clientId             : 'YOUR_CLIENT_ID',
                                audience             : 'YOUR_AUDIENCE',
                                domain               : 'YOUR_DOMAIN',
                                authZeroClientOptions: [useCookiesForTransactions: false],
                                reloginEnabled       : true
                        ],
                        clientVisible: false,
                        note         : 'Stub config for example Auth0-based OAuth implementation. Replace with your own values, or remove if not planning to use Auth0.',
                ],
                jsLicenses : [
                        groupName    : 'Technical',
                        valueType    : 'json',
                        defaultValue : [agGrid: null],
                        clientVisible: true
                ]
        ])
    }

    private void ensureRequiredPrefsCreated() {
        prefService.ensureRequiredPrefsCreated(
                [:]
//                [
//                        somePref: [
//                                groupName    : 'App',
//                                type         : 'json',
//                                defaultValue : [useFooBar: true],
//                                clientVisible: true,
//                                note         : 'Example pref for storing some JSON data.'
//                        ]
//                ]

        )
    }

    private void ensureRequiredRolesCreated() {
        roleService.ensureRequiredRolesCreated([
//                [
//                        category: 'App',
//                        name    : 'SOME_APP_ROLE',
//                        roles   : ['HOIST_ADMIN']
//                ]
        ])
    }

    @Transactional
    private void createLocalAdminUserIfNeeded() {
        String adminUsername = getInstanceConfig('bootstrapAdminUser')
        String adminPassword = getInstanceConfig('bootstrapAdminPassword')

        if (adminUsername && adminPassword) {
            def user = User.findByEmail(adminUsername)
            if (!user) {
                new User(
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
        }
    }
}
