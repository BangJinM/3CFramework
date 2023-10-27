import { INotification } from "../common/puremvc/interfaces/INotification";
import { BaseUIMediator } from "../common/ui_manager/BaseUIMediator";
import { UIEnum } from "../common/ui_manager/UIEnum";
import { NotificationTable } from "./config/NotificationTable";

export class TestMediator extends BaseUIMediator {
    static NAME: string = "TestMediator"

    constructor() {
        super(TestMediator.NAME)

        this.uiData.prefabURL = "prefabs/layer/test"
        this.uiData.uiType = UIEnum.UI_NORMAL
    }

    listNotificationInterests(): string[] {
        return [NotificationTable.Test_Open, NotificationTable.Test_Close]
    }

    handleNotification(notification: INotification): void {
        if (notification.getName() == NotificationTable.Test_Open) {
            this.OpenLayer()
        }
        else if (notification.getName() == NotificationTable.Test_Close) { }
    }
}