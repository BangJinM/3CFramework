import LocalResourcesManager from "./LocalResourcesManager";
import ReleaseManager from "./ReleaseManager";
import RemoteResourcesManager from "./RemoteResourcesManager";

let resourceManager = {
    localResourcesManager: LocalResourcesManager,
    remoteResourcesManager: RemoteResourcesManager,
    releaseManager: ReleaseManager,
}

export default resourceManager