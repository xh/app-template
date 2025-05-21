package io.xh.app.security

import grails.compiler.GrailsCompileStatic
import grails.gorm.transactions.ReadOnly
import io.xh.hoist.security.BaseAuthenticationService

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

import static io.xh.hoist.util.InstanceConfigUtils.getInstanceConfig

/**
 * Sample implementation of Hoist's {@link BaseAuthenticationService} contract for handling
 * authentication. This example is atypical of most application implementations of this service
 * in that it supports a fallback option for local username/password login as well as OAuth.
 */
@GrailsCompileStatic
class AuthenticationService extends BaseAuthenticationService  {

    AuthZeroTokenService authZeroTokenService
    UserService userService

    private String AUTH_HEADER = 'Authorization'

    static boolean getUseOAuth() {
        getInstanceConfig('useOAuth') != 'false'
    }

    Map getClientConfig() {
        useOAuth ?
            [useOAuth: true, *: authZeroTokenService.getClientConfig()] :
            [useOAuth: false]
    }

    /**
     * Evaluate a request to determine if an ID token can be extracted from headers installed by
     * the client and used to lookup/create and set an app User. This should transparently login
     * a user who has already authenticated via OAuth on the client when the UI goes to make its
     * first identity check back to the server.
     */
    protected boolean completeAuthentication(HttpServletRequest request, HttpServletResponse response) {
        if (!useOAuth) return true

        String token = request.getHeader(AUTH_HEADER)?.replace('Bearer ', '')
        TokenValidationResult tokenResult = null

        if (token) {
            tokenResult = authZeroTokenService.validateToken(token)
        } else {
            logTrace("Unable to validate inbound request - no token presented in header")
        }

        if (tokenResult) {
            def user = userService.getOrCreateFromTokenResult(tokenResult)
            setUser(request, user)
            logDebug('User read from token and set on session', [_username: user.username])
        } else {
            logDebug('Invalid token - no user set on session - return 401')
        }

        return true
    }

    /**
     * Process an interactive password-driven login - not for use by Oauth-sourced users.
     * Supported for forms-based login to admin client using the admin user created in Bootstrap.
     */
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


    @Override
    Map getAdminStats() {
        return [
            *: super.getAdminStats(),
            useOAuth: useOAuth,
            clientConfig: clientConfig
        ]
    }


    //------------------------
    // Implementation
    //------------------------
    @ReadOnly
    private User lookupUser(String username, String password) {
        def user = User.findByEmailAndEnabled(username, true)
        return user?.checkPassword(password) ? user : null
    }
}
