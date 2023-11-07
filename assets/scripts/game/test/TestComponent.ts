import * as cc from "cc";
const { ccclass } = cc._decorator;

@ccclass("TestComponent")
export class TestComponent extends cc.Component {
    label: cc.Label

    protected onLoad(): void {
    }
}