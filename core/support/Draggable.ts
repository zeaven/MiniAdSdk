export class Draggable {
    static enableDrag(target: cc.Node) {
        let offset = cc.v2();
    
        target.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            const touchPos = event.getLocation();
            const nodePos = target.parent.convertToWorldSpaceAR(target.position);
            offset = cc.v2(touchPos.x - nodePos.x, touchPos.y - nodePos.y);
        }, target);
    
        target.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            const touchPos = event.getLocation();
            const newWorldPos = touchPos.sub(offset);
            const newLocalPos = target.parent.convertToNodeSpaceAR(newWorldPos);
    
            // 获取父节点尺寸（假设它填满屏幕）
            const parentSize = target.parent.getContentSize();
            const halfParentW = parentSize.width / 2;
            const halfParentH = parentSize.height / 2;
    
            // 获取当前节点尺寸
            const halfW = target.width * target.scaleX / 2;
            const halfH = target.height * target.scaleY / 2;
    
            // 限制 x 坐标在屏幕范围内
            const x = Math.min(halfParentW - halfW, Math.max(-halfParentW + halfW, newLocalPos.x));
            // 限制 y 坐标
            const y = Math.min(halfParentH - halfH, Math.max(-halfParentH + halfH, newLocalPos.y));
    
            target.setPosition(cc.v2(x, y));
        }, target);
    }
}