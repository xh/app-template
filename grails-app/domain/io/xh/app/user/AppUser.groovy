package io.xh.app.user

import io.xh.hoist.user.HoistUser
import org.jasypt.util.password.BasicPasswordEncryptor


class AppUser implements HoistUser {

    private static encryptor = new BasicPasswordEncryptor()

    /** Email as username */
    String email

    /** Nullable password - set for local (non-Oauth) users only. */
    String password

    /** First/last display name. */
    String name

    /** External URL to profile pic - provided for Oauth users only. */
    String profilePicUrl

    boolean enabled = true

    static constraints = {
        email blank: false, unique: true, email: true, validator: {
            return validateUsername(it) ?: 'Invalid username - must be all lowercase and without spaces'
        }
        name blank: false
        password nullable: true
        profilePicUrl nullable: true, maxSize: 2048
    }

    static mapping = {
        cache true
        password column: '`password`'
    }

    boolean checkPassword(String plainPassword) {
        password ? encryptor.checkPassword(plainPassword, password) : false
    }

    //------------------------------
    // HoistUser overrides
    //-------------------------------
    boolean isActive()      {enabled}
    String getUsername()    {email}
    String getEmail()       {email}
    String getDisplayName() {name}


    //---------------------
    // Implementation
    //---------------------
    def beforeInsert() {
        encodePassword()
    }

    def beforeUpdate() {
        if (hasChanged('password')) {
            encodePassword()
        }
    }

    private encodePassword() {
        password = password ? encryptor.encryptPassword(password) : null
    }

    Map formatForJSON() {
        return HoistUser.super.formatForJSON() + [
            id: id,
            password: password ? '**********' : 'NONE',
            profilePicUrl: profilePicUrl
        ]
    }
}
