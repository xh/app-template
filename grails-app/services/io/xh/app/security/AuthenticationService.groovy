package io.xh.app.security

import grails.gorm.transactions.ReadOnly
import io.xh.app.user.AppUser
import io.xh.app.user.UserService
import io.xh.hoist.security.BaseAuthenticationService

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig

/**
 * Example AuthenticationService implementation to support both OAuth and password-based login.
 */
class AuthenticationService extends BaseAuthenticationService  {

    Auth0Service auth0Service
    UserService userService

    static boolean getUseOAuth() {
        getInstanceConfig('useOAuth') != 'false'
    }

    Map getClientConfig() {
        useOAuth ?
            [useOAuth: true, *: auth0Service.getClientConfig()] :
            [useOAuth: false]
    }

    /** Example implementation of reading + validating an OAuth ID token to authenticate a user. */
    protected boolean completeAuthentication(HttpServletRequest request, HttpServletResponse response) {
        if (!useOAuth) return true

        def token = request.getHeader('x-xh-idt'),
            tokenResult = auth0Service.validateToken(token)

        if (tokenResult) {
            def user = userService.getOrCreateFromTokenResult(tokenResult)
            setUser(request, user)
            logDebug('User read from token and set on session', [_username: user.username])
        } else {
            logDebug('Invalid token - no user set on session - return 401')
        }
        return true
    }

    /** Example implementation of validating a local password to authenticate a user. */
    boolean login(HttpServletRequest request, String username, String password) {
        def user = lookupUser(username, password)
        if (user) {
            setUser(request, user)
            return true
        }
        return false
    }

    /** Example implementation returns true to indicate support for logout (i.e. this is not an SSO app). */
    boolean logout() {
        return true
    }


    //------------------------
    // Implementation
    //------------------------
    @ReadOnly
    private AppUser lookupUser(String username, String password) {
        def user = AppUser.findByEmailAndEnabled(username, true)
        return user?.checkPassword(password) ? user : null
    }
}
