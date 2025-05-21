package io.xh.app

import io.xh.hoist.BaseController
import io.xh.hoist.security.AccessAll

@AccessAll
class HelloWorldController extends BaseController {

    def index() {
        renderJSON(greeting: "It's nice to see you, ${user.displayName}!")
    }

}
