package io.xh.app.user

import grails.gorm.transactions.ReadOnly
import grails.gorm.transactions.Transactional
import io.xh.app.security.TokenValidationResult
import io.xh.hoist.user.BaseUserService

class UserService extends BaseUserService {

    @Override
    @ReadOnly
    List<AppUser> list(boolean activeOnly) {
        return activeOnly ? AppUser.findAllByEnabled(true) : AppUser.list()
    }

    @Override
    @ReadOnly
    AppUser find(String username) {
        return AppUser.findByEmail(username)
    }

    /**
     * Example implementation queries or creates a new user from a {@link TokenValidationResult}.
     * Your app's approach to user management may (and almost certainly will) vary.
     */
    @Transactional
    AppUser getOrCreateFromTokenResult(TokenValidationResult tokenResult) {
        def email = tokenResult.email,
            name = tokenResult.name,
            profilePicUrl = tokenResult.picture,
            user = AppUser.findByEmail(email)

        if (!user) {
            user = new AppUser(
                email: email,
                name: name,
                profilePicUrl: profilePicUrl
            ).save()
            logInfo('Created user from new OAuth login', email)
        } else if (user.name != name || user.profilePicUrl != profilePicUrl) {
            user.name = name
            user.profilePicUrl = profilePicUrl
            user = user.save()
        }

        return user
    }

}
