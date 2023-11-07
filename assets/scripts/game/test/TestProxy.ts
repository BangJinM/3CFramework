import { Proxy } from "../../common/puremvc/patterns/proxy/Proxy"

class TestProxy extends Proxy {
    static NAME = "TestProxy"

    data = {}

    constructor() {
        super(TestProxy.NAME)
    }


}