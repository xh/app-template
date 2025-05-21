package io.xh.app.security

import grails.gorm.transactions.ReadOnly
import grails.gorm.transactions.Transactional
import io.xh.hoist.user.BaseUserService

class UserService extends BaseUserService {

    @Override
    @ReadOnly
    List<User> list(boolean activeOnly) {
        return activeOnly ? User.findAllByEnabled(true) : User.list()
    }

    @Override
    @ReadOnly
    User find(String username) {
        return User.findByEmail(username)
    }

    /**
     * Example implementation queries or creates a new user from a {@link TokenValidationResult}.
     * Your app's approach to user management may (and almost certainly will) vary.
     */
    @Transactional
    User getOrCreateFromTokenResult(TokenValidationResult tokenResult) {
        def email = tokenResult.email,
            name = tokenResult.name,
            profilePicUrl = tokenResult.picture,
            user = User.findByEmail(email)

        if (!user) {
            user = new User(
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
