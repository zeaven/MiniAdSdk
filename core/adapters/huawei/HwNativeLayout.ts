
export interface NativeAdData {
    adId: string
    title: string // 详情
    desc: string // 描述
    source: string // 来源
    icon: string // icon
    imgUrlList: string[] // 图片列表
    videoUrlList: string[] // 视频列表
    videoRatio: string[]
    logoUrl: string //广告标签图片 目前为空
    clickBtnTxt: string //点击按钮文本描述
    creativeType: number //广告类型 1：文字、2：大图片、3：大图文、4：GIF、6：视频文、7：小图文、8：三小图文、9：视频、10：图标（文）、103：大图文带下载按钮、106：视频文带下载按钮、107：小图文带下载按钮、108：三小图文带下载按钮、102：大图片带下载按钮、101：文字带下载按钮、110：图标（文）带下载按钮
    interactionType: number //交互类型 0：无、1：浏、2：下载类、3：浏览器（下载中间页广、4：打开应用首页、5：打开应用详情页
    appName: string //应用包名
    versionName: string //应用版本号
    appDetailUrl: string //应用介绍页面对应的H5地址，建议通过qg.openDeeplink打开网页。
    width: number //广告宽度
    height: number //广告高度
}

function loadRemoteImage(url: string, cb: (sf: cc.SpriteFrame) => void) {
    if (!url) return
    if (HwNativeLayout.preloadMaps[url]) {
        const cache = HwNativeLayout.preloadMaps[url]
        if (cache) {
            cb && cb(cache)
            return
        }
    }
    cc.assetManager.loadRemote(url, (err, tex: cc.Texture2D) => {
        if (err) return
        cb && cb(new cc.SpriteFrame(tex))
    })
}

export interface NativeAdView {
    node: cc.Node
    onClick: () => void
    onClose: () => void
    onLink: () => void
    disableCloseBtn: () => void
    disableLinkBtn: () => void
}

export default class HwNativeLayout {
    static preloadMaps = {}
    public createLayout(data: NativeAdData): NativeAdView {
        const container = new cc.Node("AdContainer");

        const adView: NativeAdView = {
            node: container,
            onClick: null,
            onClose: null,
            onLink: null,
            disableCloseBtn: null,
            disableLinkBtn: null
        }
        // 这里可以根据不同的 creativeType 来创建不同的模板
        const initializer = new NormalTemplate(adView)
        initializer.init(data)

        return adView
    }
    public preLoad(data: NativeAdData) {
        if (!data) return
        data.imgUrlList.forEach((url) => {
            loadRemoteImage(url, (fs) => {
                HwNativeLayout.preloadMaps[url] = fs
            })
        })
        loadRemoteImage(data.icon, (fs) => {
            HwNativeLayout.preloadMaps[data.icon] = fs
        })
    }
}


class NormalTemplate {
    adView: NativeAdView
    constructor(adView: NativeAdView) {
        this.adView = adView
    }
    init(data: NativeAdData) {
        const container = this.adView.node
        const width = data.width
        const height =  data.height
        const infoHeight = height * 0.2
        container.anchorX = 0.5
        container.anchorY = 0.5
        container.setPosition(0, 0)
        container.width = width
        container.height = height

        const bgSprite = container.addComponent(cc.Sprite)
        bgSprite.type = cc.Sprite.Type.SIMPLE
        bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        bgSprite.spriteFrame = new cc.SpriteFrame()
        bgSprite.spriteFrame.setTexture(new cc.Texture2D())
        bgSprite.spriteFrame.getTexture().initWithData(new Uint8Array([255, 255, 255, 255]),cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
        bgSprite.spriteFrame.getTexture().handleLoadedTexture()
        bgSprite.node.color = cc.Color.BLACK
  
        // 使用 Widget 自动撑满父节点
        container.addComponent(cc.Widget).alignMode = cc.Widget.AlignMode.ONCE
    
        // 1. 背景图区域（填满）
        const imageArea = new cc.Node('ImageArea')
        imageArea.setAnchorPoint(0.5, 0.5)
        imageArea.setPosition(0, 0)
        imageArea.setContentSize(width, height)
        container.addChild(imageArea, 0) // 最底层

        let currentX = 0
        const imgWidth = width / data.imgUrlList.length
        data.imgUrlList.forEach((url) => {
            const imgNode = new cc.Node('BgImg')
            imgNode.setAnchorPoint(0.5, 0.5)
            imgNode.setContentSize(imgWidth, height)
            imgNode.setPosition(currentX + imgWidth / 2 - width / 2, 0)

            const sprite = imgNode.addComponent(cc.Sprite)
            loadRemoteImage(url, (sf) => {
                delete HwNativeLayout.preloadMaps[url]
                sprite.spriteFrame = sf
                sprite.type = cc.Sprite.Type.SIMPLE
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
                const scaleX = imgWidth / sf.getOriginalSize().width
                const scaleY = height / sf.getOriginalSize().height
                imgNode.scaleX = scaleX
                imgNode.scaleY = scaleY
            })

            imageArea.addChild(imgNode)
            currentX += imgNode.width
        })

        // 2. 关闭按钮（右上角）
        const closeBtn = new cc.Node('CloseBtn')
        closeBtn.setAnchorPoint(1, 1)
        closeBtn.setContentSize(40, 40)
        closeBtn.setPosition(width / 2 - 10, height / 2 - 10) // 右上角偏移 10
        const closeLabel = closeBtn.addComponent(cc.Label)
        closeLabel.string = 'X'
        closeLabel.fontSize = 24
        closeBtn.color = cc.Color.GRAY
        closeBtn.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation() // 阻止冒泡到 container
            this.adView.onClose?.()
        })
        container.addChild(closeBtn, 10)

        this.adView.disableCloseBtn = () => closeBtn.active = false

        // 视频
        // 判断是否有视频
        if (data.videoUrlList && data.videoUrlList.length > 0) {
            // 创建视频播放器节点
            const videoNode = new cc.Node('VideoPlayer')
            videoNode.setAnchorPoint(0.5, 1)
            videoNode.setPosition(0, height / 2)
            videoNode.setContentSize(width, height * 0.65)
            
            const videoPlayer = videoNode.addComponent(cc.VideoPlayer)
            videoPlayer.resourceType = cc.VideoPlayer.ResourceType.REMOTE
            videoPlayer.remoteURL = data.videoUrlList[0]
            // videoPlayer.play()
            videoPlayer.keepAspectRatio = true // 保持宽高比
            videoPlayer.mute = true // 默认静音播放
            // 设置视频样式，保持宽高比
            videoPlayer.node.on('ready-to-play', () => {
                videoPlayer.play();
            });
            
            container.addChild(videoNode, 9)
        }

        // 文字区域
        const infoArea = new cc.Node('InfoArea')
        infoArea.setAnchorPoint(0, 0)
        infoArea.setContentSize(width, infoHeight)
        infoArea.setPosition(-width / 2, -height / 2) // 贴底部
        infoArea.color = cc.color(0, 0, 0, 100) // 半透明背景
        const infoBg = infoArea.addComponent(cc.Sprite)
        infoBg.type = cc.Sprite.Type.SIMPLE
        infoBg.sizeMode = cc.Sprite.SizeMode.CUSTOM
        infoBg.spriteFrame = new cc.SpriteFrame()
        infoBg.spriteFrame.setTexture(new cc.Texture2D())
        infoBg.spriteFrame.getTexture().initWithData(new Uint8Array([0, 0, 0, 150]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
        infoBg.spriteFrame.getTexture().handleLoadedTexture()
        container.addChild(infoArea, 8)

        const iconNode = new cc.Node('Icon')
        iconNode.setAnchorPoint(0, 0.5)
        iconNode.setPosition(10, infoHeight / 2)
        iconNode.setContentSize(80, 80)
        const iconSprite = iconNode.addComponent(cc.Sprite)
        loadRemoteImage(data.icon, (sf) => {
            delete HwNativeLayout.preloadMaps[data.icon]
            iconSprite.spriteFrame = sf
            const size = sf.getOriginalSize()
            iconNode.scaleX = 80 / size.width
            iconNode.scaleY = 80 / size.height
        })
        infoArea.addChild(iconNode)


        const textArea = new cc.Node('TextArea')
        textArea.setAnchorPoint(0, 0.5)
        textArea.setPosition(100, infoHeight / 2)
        textArea.setContentSize(width - 110, infoHeight)
        infoArea.addChild(textArea)

        // appName
        const title = new cc.Node('Title')
        title.setAnchorPoint(0, 0)
        title.setPosition(0, 15)
        title.setContentSize(textArea.width, 22)
        const titleLabel = title.addComponent(cc.Label)
        titleLabel.string = data.desc ? data.appName: data.source
        titleLabel.fontSize = 20
        titleLabel.lineHeight = 22
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT
        textArea.addChild(title)

        // title
        const subtitle = new cc.Node('Subtitle')
        subtitle.setAnchorPoint(0, 0.5)
        subtitle.setPosition(0, -2)
        subtitle.setContentSize(textArea.width, 40)
        const subtitleLabel = subtitle.addComponent(cc.Label)
        subtitleLabel.string = data.desc || data.title
        subtitleLabel.fontSize = 16
        subtitleLabel.lineHeight = 20
        subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT
        // 自动换行关键设置 👇
        subtitleLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        subtitleLabel.enableWrapText = true;

        // 这一步确保 node 的 width 设置好
        subtitle.width = textArea.width;
        textArea.addChild(subtitle)

        // 下载按钮
        const btnArea = new cc.Node('ButtonArea')
        btnArea.color = cc.Color.WHITE
        btnArea.setAnchorPoint(0, 0)
        btnArea.setPosition(0, -infoHeight/2 + 5)
        btnArea.setContentSize((width - 100), 30)
        // 添加 BlockInputEvents 组件确保按钮区域可以接收点击事件
        btnArea.addComponent(cc.BlockInputEvents)
        textArea.addChild(btnArea)

        const btnBg = btnArea.addComponent(cc.Sprite)
        btnBg.type = cc.Sprite.Type.SIMPLE
        btnBg.sizeMode = cc.Sprite.SizeMode.CUSTOM
        btnBg.spriteFrame = new cc.SpriteFrame()
        btnBg.spriteFrame.setTexture(new cc.Texture2D())
        btnBg.spriteFrame.getTexture().initWithData(new Uint8Array([1,1,1,1]),cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
        btnBg.spriteFrame.getTexture().handleLoadedTexture()
        btnBg.node.color = cc.Color.BLACK


        // 添加 Label 作为子节点，单独居中处理
        const labelNode = new cc.Node('BtnLabel')
        labelNode.setAnchorPoint(0.5, 0.5)
        labelNode.setPosition((width - 100)/2 - 40, 15) // 居中
        const btnLabel = labelNode.addComponent(cc.Label)
        btnLabel.string = data.clickBtnTxt || '点击查看'
        btnLabel.fontSize = 18
        btnLabel.lineHeight = 22
        btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        btnLabel.verticalAlign = cc.Label.VerticalAlign.CENTER
        btnArea.addChild(labelNode)
        

        // btnArea.on(cc.Node.EventType.TOUCH_END, () => {
        //     if (window['qg']) {
        //         window['qg'].openDeepLink(data.appDetailUrl)
        //     } else {
        //         cc.sys.openURL(data.appDetailUrl)
        //     }
        // })
        btnArea.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation() // 阻止冒泡到 container
            this.adView.onLink?.()
        }, null, true)

        this.adView.disableLinkBtn = () => btnArea.active = false


        container.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation()
            this.adView.onClick?.()
        })

    }
    
}