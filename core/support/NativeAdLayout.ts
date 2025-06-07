import { Draggable } from "./Draggable"
import { AdType, Callback, Runnable } from "../Types"
import device from "./Device"

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
    permissionUrl: string //应用安装权限说明页面对应的H5地址，建议通过qg.openDeeplink打开网页。
}

function loadRemoteImage(url: string, cb?: (sf: cc.SpriteFrame) => void) {
    if (!url) return
    if (!NativeAdLayout.preloadMaps[url]) {
        NativeAdLayout.preloadMaps[url] = new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(url, (err, tex: cc.Texture2D) => {
                if (err) return
                resolve(new cc.SpriteFrame(tex))
            })
        })
    }
    NativeAdLayout.preloadMaps[url].then(res => {
        cb && cb(res)
    })
}

export interface NativeAdView {
    node: cc.Node
    attach: (node: cc.Node) => void
  
    /**
     * 广告区域被点击时的回调
     */
    onClick?: Runnable
    /**
     * 广告按钮[clickBtnTxt]被点击时的回调，注意不是原生下载按钮
     */
    onLink?: Runnable
    /**
     * 广告关闭按钮被点击时的回调
     */
    onClose?: Runnable
    /**
     * 点击遮罩时的回调，模态框有效
     */
    onMaskClick?: Runnable
    disableLinkBtn?: Runnable
    /**
     * 打开应用详情页
     */
    openApp: Runnable
    /**
     * 是否模态框
     * @param enable true/false
     * @returns 
     */
    modal: (enable: boolean) => void
    /**
     * 关闭广告
     */
    close: Runnable
    /**
     * banner 广告的位置
     * @param gravity top/bottom
     * @returns 
     */
    gravity: (gravity: 'top' | 'bottom') => void
    // #region 策略方法
    setNativeDownloadBtnTransparent?: (transparent: boolean) => void
    setCloseBtnScale?: (scale: number) => void
    setCloseBtnAlpha?: (alpha: number) => void
    setCloseBtnIncorrectClickRate?: (rate: number) => void
    // #endregion
    
}



export default class NativeAdLayout {
    static preloadMaps = {}
    /**
     * 
     * @param data 
     * @param type 0 为原生广告，1 原生插屏，2 原生banner, 3 浮动icon
     * @returns 
     */
    public createLayout(data: NativeAdData, type: AdType = AdType.None): NativeAdView {
        const layer = new cc.Node("AdLayer");

        // this.onClick()
        const match = data.permissionUrl?.match(/packageName=([^&"]+)/);
        const packageName = match?.[1] ?? null;

        const adView: NativeAdView = this.getDefaultAdView(layer, packageName)
        
        // 这里可以根据不同的 creativeType 来创建不同的模板
        const initializer = new NormalTemplate(adView)
        initializer.init(data, type)
        return adView
    }
    private getDefaultAdView(layer: cc.Node, packageName: string): NativeAdView {
        let isDestroyed = false
        const adView: NativeAdView = {
            node: layer,
            attach: (parent: cc.Node) => {
                const parentSize = parent.getContentSize();
                const parentAnchor = parent.getAnchorPoint();

                const dialogSize = adView.node.getContentSize();
                const dialogAnchor = adView.node.getAnchorPoint();

                const x = parentSize.width * parentAnchor.x - dialogSize.width * dialogAnchor.x;
                const y = parentSize.height * parentAnchor.y - dialogSize.height * dialogAnchor.y;

                adView.node.setPosition(x, y);
                parent.addChild(adView.node);
            },
            modal: (enable: boolean) => {
                layer.removeComponent(cc.BlockInputEvents)
                if (enable) {
                    layer.addComponent(cc.BlockInputEvents)
                    layer.on(cc.Node.EventType.TOUCH_END, () => {
                        adView.onMaskClick?.()
                    })
                }
            },
            openApp: () => {
                if (packageName) {
                    adView.close()
                    qg.downloadApp({
                        packageName: packageName,
                        success: () => {
                        },
                        fail: (err) => {
                            console.error('打开应用失败', err)
                        },
                    })
                } else {
                    adView.onClick?.()
                }
            },
            close: () => {
                if (!isDestroyed && adView.node.getParent()) {
                    isDestroyed = true
                    adView.onClose?.()
                    adView.node.destroy()
                }
            },
            gravity: null
        }
        return adView
    }

    public preLoad(data: NativeAdData) {
        if (!data) return
        NativeAdLayout.preloadMaps = {}
        data.imgUrlList.forEach((url) => {
            loadRemoteImage(url)
        })
        loadRemoteImage(data.icon)
    }
}


class NormalTemplate {
    adView: NativeAdView
    inCorrectClickRate: number
    constructor(adView: NativeAdView) {
        this.adView = adView
        this.inCorrectClickRate = 0
    }
    init(data: NativeAdData, type: AdType) {
        const layer = this.adView.node

        const isLandscape = device.isLandscape()
        const deviceSize = device.getSize()
        let width = deviceSize.width
        let height = deviceSize.height
        
        if (type === AdType.NativeInterstitial) {
            width *= isLandscape ? 0.4 : 0.85
            height *= isLandscape ? 0.6 : 0.35
            // 模态框，屏蔽背景点击
            this.adView.modal(true)
        } else if (type === AdType.NativeBanner) {
            width *= isLandscape ? 0.5 : 1
            // banner 调试是屏幕高度的8%，或最小为 60（横屏状态下）
            height = isLandscape ? 60: height * 0.07
        } else if (type === AdType.NativeIcon) {
            // icon 大小为屏幕高度的10%，或最大为 70
            width = Math.min(70, Math.max(height, width) * 0.07)
            height = width
        } else {
            width *= isLandscape ? 0.4 : 0.85
            height *= isLandscape ? 0.7 : 0.35
            // 模态框，屏蔽背景点击
            this.adView.modal(true)
        }
        
        layer.setAnchorPoint(0.5, 0.5);
        layer.setPosition(0, 0);
        layer.setContentSize(cc.winSize.width, cc.winSize.height);
        const container = new cc.Node('AdContainer')
        const infoHeight = Math.min(100, height)
        const mainImgEnable = height >= 320
        container.anchorX = 0.5
        container.anchorY = 0.5
        container.setPosition(0, 0)
        container.width = width
        container.height = height
        layer.addChild(container)

        if (width <= 100 && width === height) {
            container.setPosition(cc.winSize.width * 0.5 - width, 0)
            Draggable.enableDrag(container)
            layer.zIndex = 999
        }

        this.adView.gravity = (gravity) => {
            if (gravity === 'top') {
                container.y = cc.winSize.height / 2 - height / 2
            } else {
                container.y = -cc.winSize.height / 2 + height / 2
            }
        }

        if (width > 100) {
            const bgSprite = container.addComponent(cc.Sprite)
            bgSprite.type = cc.Sprite.Type.SIMPLE
            bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
            bgSprite.spriteFrame = new cc.SpriteFrame()
            bgSprite.spriteFrame.setTexture(new cc.Texture2D())
            bgSprite.spriteFrame.getTexture().initWithData(new Uint8Array([50,50,50,200]),cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
            bgSprite.spriteFrame.getTexture().handleLoadedTexture()
        }
  
        // 使用 Widget 自动撑满父节点
        // container.addComponent(cc.Widget).alignMode = cc.Widget.AlignMode.ONCE
    
        if (width > 100) {
            // 1. 背景图区域（填满）
            const imageArea = new cc.Node('ImageArea')
            imageArea.setAnchorPoint(0.5, 0.5)
            imageArea.setPosition(0, 0)
            imageArea.setContentSize(width, height)
            container.addChild(imageArea, 1) // 最底层
    
            let currentX = 0
            const imgWidth = width / data.imgUrlList.length
            data.imgUrlList.forEach((url) => {
                const imgNode = new cc.Node('BgImg')
                imgNode.setAnchorPoint(0.5, 0.5)
                imgNode.setContentSize(imgWidth, height)
                imgNode.setPosition(currentX + imgWidth / 2 - width / 2, 0)
    
                const sprite = imgNode.addComponent(cc.Sprite)
                loadRemoteImage(url, (sf) => {
                    NativeAdLayout.preloadMaps[url]
                    sprite.spriteFrame = sf
                    sprite.type = cc.Sprite.Type.SIMPLE
                    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
                    const scaleX = imgWidth / sf.getOriginalSize().width
                    const scaleY = height / sf.getOriginalSize().height
                    imgNode.scaleX = scaleX
                    imgNode.scaleY = scaleY
                    imgNode.opacity = mainImgEnable ? 120 : 255
                })
    
                imageArea.addChild(imgNode)
                currentX += imgNode.width
            })
            
            if (mainImgEnable) {
                // 2. 主图区域（居中）
                const mainImgNode = new cc.Node('MainImg')
                loadRemoteImage(data.imgUrlList?.[0], (firstImgSprite) => {
                    const mainImgHeight = height - infoHeight
                    const scaleY = mainImgHeight / firstImgSprite.getOriginalSize().height
                    const scaleX = width / firstImgSprite.getOriginalSize().width
                    const scale = Math.min(scaleX, scaleY)
                    mainImgNode.setAnchorPoint(0.5, 1)
                    mainImgNode.setPosition(0, height * 0.5)
                    
                    mainImgNode.setContentSize(firstImgSprite.getOriginalSize().width * scale, firstImgSprite.getOriginalSize().height * scale)
                    const mainImgSprite = mainImgNode.addComponent(cc.Sprite)
                    mainImgSprite.spriteFrame = firstImgSprite
                    mainImgSprite.type = cc.Sprite.Type.SIMPLE
                    mainImgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
                    mainImgNode.scale = scale
                    if (type === AdType.Native) {
                        cc.tween(mainImgNode)
                            .repeatForever(
                              cc.tween()
                                .to(1, { scale: scale * 0.97 })
                                .to(1, { scale: scale })
                            )
                            .start()
                    }
                })
                container.addChild(mainImgNode, 5)
            }
        }

        // 1. 广告标识（左上角）
        const logoNode = new cc.Node('Logo')
        
        logoNode.setAnchorPoint(0, 1)
        logoNode.setContentSize(30, 30)
        logoNode.setPosition(-width / 2 + 20, height / 2 - 10) // 左上角偏移 10
        const logoBg = logoNode.addComponent(cc.Graphics)
        logoBg.clear()
        logoBg.fillColor = cc.color(100, 100, 100, 120);  // 灰色背景
        logoBg.roundRect(-15, -10, 30, 20, 5)
        logoBg.fill()
        const logoNode2 = new cc.Node('LabelNode')
        logoNode2.setParent(logoNode)
        const logoLabel = logoNode2.addComponent(cc.Label)
        logoLabel.string = 'AD'
        logoLabel.fontSize = 13
        logoLabel.lineHeight = 16
        logoLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        logoLabel.verticalAlign = cc.Label.VerticalAlign.CENTER
        logoNode.color = cc.Color.WHITE
      
        container.addChild(logoNode, 10)

        // 2. 关闭按钮（右上角）
        const closeBtn = new cc.Node('CloseBtn')
        closeBtn.setAnchorPoint(0.5, 0.5)
        closeBtn.setContentSize(14, 14)
        closeBtn.setPosition(width / 2 - 12, height / 2 - 10) // 右上角偏移 10
        const closeBg = closeBtn.addComponent(cc.Graphics)
        closeBg.clear()
        closeBg.fillColor = cc.color(100, 100, 100, 150);  // 灰色背景
        closeBg.roundRect(-9, -9, 18, 18, 9)
        closeBg.fill()
        const closeNode2 = new cc.Node('LabelNode2')
        closeNode2.setParent(closeBtn)
        const closeLabel = closeNode2.addComponent(cc.Label)
        closeLabel.string = 'X'
        closeLabel.fontSize = 12
        closeBtn.color = new cc.Color(180, 180, 180, 150)
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        closeLabel.verticalAlign = cc.Label.VerticalAlign.CENTER
        closeBtn.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.inCorrectClickRate > 0) {
                if (Math.random() < this.inCorrectClickRate / 100) {
                    // 误触，不关闭
                    return
                }
            }
            event.stopPropagation() // 阻止冒泡到 container
            this.adView.close()
        })
        container.addChild(closeBtn, 10)

        this.adView.setCloseBtnScale = (scale) => {
            closeBtn.scale = scale
        }
        this.adView.setCloseBtnAlpha = (alpha) => {
            closeBtn.color = new cc.Color(180, 180, 180, 255 * alpha)
        }
        this.adView.setCloseBtnIncorrectClickRate = (rate) => {
            this.inCorrectClickRate = rate
        }

        // 视频  视频区域无法触发点击事件
        // 判断是否有视频
        // if (data.videoUrlList && data.videoUrlList.length > 0) {
        //     // 创建视频播放器节点
        //     const videoNode = new cc.Node('VideoPlayer')
        //     videoNode.setAnchorPoint(0.5, 1)
        //     videoNode.setPosition(0, height / 2)
        //     videoNode.setContentSize(width, height * 0.65)
            
        //     const videoPlayer = videoNode.addComponent(cc.VideoPlayer)
        //     videoPlayer.resourceType = cc.VideoPlayer.ResourceType.REMOTE
        //     videoPlayer.remoteURL = data.videoUrlList[0]
        //     // videoPlayer.play()
        //     videoPlayer.keepAspectRatio = true // 保持宽高比
        //     videoPlayer.mute = true // 默认静音播放
        //     // 设置视频样式，保持宽高比
        //     videoPlayer.node.on('ready-to-play', () => {
        //         videoPlayer.play();
        //     });
            
        //     container.addChild(videoNode, 5)
        // }

        // 文字区域
        const infoArea = new cc.Node('InfoArea')
        infoArea.setAnchorPoint(0.5, 0.5)
        infoArea.setContentSize(width, infoHeight)
        infoArea.setPosition(0, (infoHeight-height) * 0.5) // 贴底部
        if (width > 100) {
            // 半透明背景
            const infoBg = infoArea.addComponent(cc.Sprite)
            infoBg.type = cc.Sprite.Type.SIMPLE
            infoBg.sizeMode = cc.Sprite.SizeMode.CUSTOM
            infoBg.spriteFrame = new cc.SpriteFrame()
            infoBg.spriteFrame.setTexture(new cc.Texture2D())
            infoBg.spriteFrame.getTexture().initWithData(new Uint8Array([0, 0, 0, mainImgEnable ? 0: 80]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
            infoBg.spriteFrame.getTexture().handleLoadedTexture()
        }
        container.addChild(infoArea, 8)
        
        let iconWidth = 0
        if (!data.icon) {
            if (width === height && width < 100) {
                //  icon 模式用主图代替
                data.icon = data.imgUrlList?.[0]
            }
        }
        if (data.icon) {
            const iconNode = new cc.Node('Icon')
            iconWidth = infoHeight * 0.8
            const iconHeight = iconWidth
            iconNode.setAnchorPoint(0.5,0.5)
            iconNode.setContentSize(iconWidth, iconHeight)
            iconNode.setPosition((iconWidth-width)*0.5 + 9,0)
            const iconSprite = iconNode.addComponent(cc.Sprite)
            loadRemoteImage(data.icon, (sf) => {
                delete NativeAdLayout.preloadMaps[data.icon]
                iconSprite.spriteFrame = sf
                const size = sf.getOriginalSize()
                iconNode.scaleX = iconWidth / size.width
                iconNode.scaleY = iconHeight / size.height
                if (width <= 100 && width <= height) {
                    iconNode.scaleX *= 1.2
                    iconNode.scaleY *= 1.2
                }
            })
            infoArea.addChild(iconNode)
        }

        if (width >= 200) {
            const textArea = new cc.Node('TextArea')
            const textAreaWidth = width - iconWidth - 20
            textArea.setAnchorPoint(0.5, 0.5)
            textArea.setPosition(-textAreaWidth*0.5 + (iconWidth+10) * 0.5, 0)
            textArea.setContentSize(textAreaWidth, infoHeight)
            infoArea.addChild(textArea)

            // appName
            const fontSize = Math.max(infoHeight * .17, 14)
            const title = new cc.Node('Title')
            title.setAnchorPoint(0.5, 1)
            title.setPosition(textAreaWidth/2, (infoHeight / 2) * .8)
            title.setContentSize(textAreaWidth, fontSize + 2)
            const titleLabel = title.addComponent(cc.Label)
            titleLabel.string = data.desc ? data.appName: data.source
            titleLabel.fontSize = fontSize
            titleLabel.lineHeight = fontSize + 2
            titleLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT
            textArea.addChild(title)

            if (width >= 300 && (data.desc || data.title)) {
                // title
                const subtitle = new cc.Node('Subtitle')
                subtitle.setAnchorPoint(0, 1)
                subtitle.setPosition(0, (infoHeight / 2) * .8 - (fontSize + 2))
                subtitle.setContentSize(textAreaWidth, 40)
                const subtitleLabel = subtitle.addComponent(cc.Label)
                subtitleLabel.string = data.desc || data.title
                subtitleLabel.fontSize = fontSize - 2
                subtitleLabel.lineHeight = fontSize
                subtitleLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT
                // 自动换行关键设置 👇
                subtitleLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                subtitleLabel.enableWrapText = true;
        
                // 这一步确保 node 的 width 设置好
                subtitle.width = textArea.width;
                textArea.addChild(subtitle)
            } else {
                title.setAnchorPoint(0.5, 0.5)
                title.setPosition(textAreaWidth/2, 0)
            }

            if (infoHeight >= 95 && width > 300) {
                // 下载按钮
                const btnArea = new cc.Node('ButtonArea')
                btnArea.color = cc.Color.WHITE
                btnArea.setAnchorPoint(0, 0)
                btnArea.setPosition(0, -infoHeight/2 + 5)
                btnArea.setContentSize((textAreaWidth), 30)
                // 添加 BlockInputEvents 组件确保按钮区域可以接收点击事件
                btnArea.addComponent(cc.BlockInputEvents)
                btnArea.active = infoHeight >= 95
                textArea.addChild(btnArea)
    
                const btnBg = btnArea.addComponent(cc.Sprite)
                btnBg.type = cc.Sprite.Type.SIMPLE
                btnBg.sizeMode = cc.Sprite.SizeMode.CUSTOM
                btnBg.spriteFrame = new cc.SpriteFrame()
                btnBg.spriteFrame.setTexture(new cc.Texture2D())
                btnBg.spriteFrame.getTexture().initWithData(new Uint8Array([1,1,1,1]),cc.Texture2D.PixelFormat.RGBA8888, 1, 1)
                btnBg.spriteFrame.getTexture().handleLoadedTexture()
    
    
                // 添加 Label 作为子节点，单独居中处理
                const labelNode = new cc.Node('BtnLabel')
                labelNode.setAnchorPoint(0.5, 0.5)
                labelNode.setPosition((textAreaWidth)/2, 15) // 居中
                const btnLabel = labelNode.addComponent(cc.Label)
                btnLabel.string = data.clickBtnTxt || '点击查看'
                btnLabel.fontSize = fontSize
                btnLabel.lineHeight = fontSize + 4
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
            }
        }



        container.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation()
            if (Draggable.wasDragging(container)) return; // 忽略拖动
            this.adView.onClick?.()
        })

    }
    
}