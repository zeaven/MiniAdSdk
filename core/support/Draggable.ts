export class Draggable {
    static enableDrag(target: cc.Node) {
        let offset = cc.v2();
        let startTouchPos = cc.v2();
        let isDragging = false;
        const DRAG_THRESHOLD = 10;

        target.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            const touchPos = event.getLocation();
            startTouchPos = touchPos.clone();
            const nodePos = target.parent.convertToWorldSpaceAR(target.position);
            offset = cc.v2(touchPos.x - nodePos.x, touchPos.y - nodePos.y);
            isDragging = false;
        }, target);

        target.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            const touchPos = event.getLocation();
            if (!isDragging && touchPos.sub(startTouchPos).mag() > DRAG_THRESHOLD) {
                isDragging = true;
            }

            if (isDragging) {
                const newWorldPos = touchPos.sub(offset);
                const newLocalPos = target.parent.convertToNodeSpaceAR(newWorldPos);

                const parentSize = target.parent.getContentSize();
                const halfParentW = parentSize.width / 2;
                const halfParentH = parentSize.height / 2;

                const halfW = target.width * target.scaleX / 2;
                const halfH = target.height * target.scaleY / 2;

                const x = Math.min(halfParentW - halfW, Math.max(-halfParentW + halfW, newLocalPos.x));
                const y = Math.min(halfParentH - halfH, Math.max(-halfParentH + halfH, newLocalPos.y));

                target.setPosition(cc.v2(x, y));
            }
        }, target);

        target.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (isDragging) {
                // 拖动，阻止点击逻辑
                target['_wasDragging'] = true;
            } else {
                target['_wasDragging'] = false;
            }
        }, target);
    }

    static wasDragging(target: cc.Node): boolean {
        return !!target['_wasDragging'];
    }
}
