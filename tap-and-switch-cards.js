class TapAndSwitchCards extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.ha = document.querySelector("home-assistant");
    this.main = this.ha.shadowRoot.querySelector(
      "home-assistant-main"
    ).shadowRoot;
    // this.lovelace = this.main.querySelector("ha-panel-lovelace");
    this.lovelace = this.main.querySelector("partial-panel-resolver").querySelector("ha-panel-lovelace");
    console.log("oubotest",this.lovelace);
    // this.count = TapAndSwitchCards.idCounter++;
    // console.log("constructor",this.count);
  }

  setConfig(config) {
    // console.log("config",this.count);
    this.config = config;
    this._refCards = [];
    this._refTitleCard =[];
    this._init__refCards().then(() => {
      // console.log("this._refCard"+this.count,this._refCards);
      this.render(); 
      // setTimeout(() => {
      //   this.shadowRoot.querySelector(".o_nav_button").click();         
      // }, 0);
      
    });
    
  }
 
  set hass(hass) {
    // console.log("hass");
    this._hass = hass;
    if (this._refTitleCard && this._refTitleCard.length > 0) {
      this._refTitleCard.forEach((card) => {  
          // console.log("not_o_popup");
          card.hass = hass;       
      });
    }
    if (this._refCards) {
      this._refCards.forEach((card) => {  
          // console.log("not_o_popup");
          card.hass = hass;       
      });
    }

  }

  async getCardSize() {

  }

  processConfig(lovelace, config) {

  }

  connectedCallback() {
    // console.log("cb",this.count);
   
    // 取消注册旧的事件处理函数
    // window.removeEventListener("location-changed", this.handleLocationChanged);

    // 注册新的事件处理函数
    // window.addEventListener("location-changed", this.handleLocationChanged);

  }

  disconnectedCallback() {
    // console.log("discb",this.count);
    // 在元素被移除时取消注册事件处理函数
    // window.removeEventListener("location-changed", this.handleLocationChanged);
  }

  //生成子卡片Dom，保存到this._refCards数组中
  async _init__refCards() {
    // console.time('_init__refCards');
    const config = this.config;
    if (window.loadCardHelpers) {
      this.helpers = await window.loadCardHelpers();
    }
    //配置titleCards。
    let titlePromises; 
    if(config.titleCards && (config.titleCards.length > 0)){
      titlePromises = config.titleCards.map(async (config) => {
        return await this.createCardElement(config); 
      });
      this._refTitleCard = await Promise.all(titlePromises);
      this._refTitleCard = this._refTitleCard.filter(card => card !== undefined);
    } 

    let promises = config.cards.map(async (config) => {
      let card = await this.createCardElement(config);
      
        card.setAttribute("data-mainPathName", config.card_path_name);
        return card;
      
    });

    this._refCards = await Promise.all(promises);
    this._refCards = this._refCards.filter(card => card !== undefined);
    // console.timeEnd('_init__refCards');
  }
 
  //将所有的元素，添加到this.shadow
  render() {
    // 创建 CSS style
    // console.time('render');
    var style = document.createElement("style");
    var navCardHeight = "100vh";
    var mainNavHeight = parseInt(document.documentElement.style.getPropertyValue('--header-height'),10) || 80; //主导航的高度,单位是px
    var subNavHeight = this.config.nav_height || 60; //主导航的高度,单位是px
    var oHeaderHeight = 0;
      //子框架的格式
    
    this.shadowRoot.innerHTML = "";                  
    
    oHeaderHeight = this.config.sticky_top || 0;
    console.log("stickytop", this.config.sticky_top);
    let header_style = document.createElement("style");
    header_style.textContent = `
    .o_header_title {
      position: sticky;
      top: ${ this.config.sticky_top || "0px" } ;
      width: 100%;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: large;
      flex-shrink: 0;
      z-index:1500;
      background: var(--primary-background-color);
    }
    
    .o_header_title:active {
      transform: scale(0.9);
      
    }
    .o_header_icon {
      position: absolute;
      right: 10%;
    }
    .o_header_icon svg {
      width:20px;
      
    }
    .o_header_content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 4px 4px;
    }
    `;
    // let o_header = document.createElement("div");    
    // o_header.setAttribute("class", "o_header");
    let o_header_title = document.createElement("div"); 
    o_header_title.innerText = this.config.popup_title || "未定义";
    o_header_title.setAttribute("class", "o_header_title");
    o_header_title.addEventListener("click", (event)=>{this.handleTitleClick(event,this.config.o_back_path)});

    

    
    let o_header_content = document.createElement("div"); 
    o_header_content.setAttribute("class", "o_header_content");
    let o_header_icon = document.createElement("div");
    o_header_icon.setAttribute("class", "o_header_icon");
    o_header_icon.innerHTML = `
    <svg t="1702613064248" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14439" width="200" height="200"><path d="M574.293333 512 810.666667 748.373333 810.666667 810.666667 748.373333 810.666667 512 574.293333 275.626667 810.666667 213.333333 810.666667 213.333333 748.373333 449.706667 512 213.333333 275.626667 213.333333 213.333333 275.626667 213.333333 512 449.706667 748.373333 213.333333 810.666667 213.333333 810.666667 275.626667 574.293333 512Z" p-id="14440"></path></svg>
    `;
    this._refTitleCard.forEach((card)=>{
      o_header_content.appendChild(card);
    });
    
    // this.shadow.appendChild(o_header);  
         
               
    

    //创建主体部分 nav 和 body
    var o_nav = document.createElement("div");
    o_nav.setAttribute("class", "o_nav");
    var o_body = document.createElement("div");
    o_body.setAttribute("class", "o_body");
    

    this._refCards.forEach((card) => {  
      o_body.appendChild(card);
    });
    
    //nav部分
    // var eventObj = new Event('subNavClick',{ bubbles: true });
    this.config.nav_buttons.forEach((button, index) => {
      let div = document.createElement("div");
      
      div.setAttribute("class", "o_nav_button");
      div.setAttribute("data-hash", button.link_id);
      div.addEventListener("click", (event)=>{this.handleNavClick(event)});
      
      if (button.show != "t") {
        let ha_icon = document.createElement("ha-icon");
        ha_icon.setAttribute("icon", button.icon);
        div.appendChild(ha_icon);
      }
      if (button.show != "i") {
        let p = document.createElement("p");
        p.setAttribute("class", "o_nav_text");
        p.innerText = button.name;
        div.appendChild(p);
      }
      o_nav.appendChild(div);
    });
    //卡片的主体
    
    
    style.textContent = `
    :host {
      --nav-height: ${subNavHeight}px;
      /*--ha-card-border-radius: var(--restore-card-border-radius) !important;*/
      --ha-card-border-radius: unset !important;
      display: flex;
      z-index: 3;
      top: 0;
      left: 0;
      width: 100%; 
      /*max-height: calc(100vh - ${mainNavHeight}px);*/
      /*overflow: auto;*/
      flex-shrink: 0;
      flex-direction: column;
      justify-content: flex-end;
      overscroll-behavior-y: contain;
      /*min-height: calc(100vh - ${mainNavHeight-1}px);*/
    }

    .o_body {
      /*overflow: auto;  */
      -webkit-overflow-scrolling: touch;
      /*display: grid;*/
      /*margin-bottom: auto;*/
      margin-right: auto;
      width: 100%;
      /*min-height: calc(100vh - ${mainNavHeight}px - ${subNavHeight}px + 2px);*/
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */

    }
    .o_body::-webkit-scrollbar {
      width: 0; /* 隐藏垂直滚动条 */
    }
    .o_body::-webkit-scrollbar-thumb {
      background-color: transparent; /* 滚动条的拖动部分背景色设为透明 */
    }

    .o_nav {
      background: var(--primary-background-color);
      position: sticky;
      display: flex;
      top: ${oHeaderHeight}px;
      flex-direction: row;
      z-index: 3;
      flex-shrink: 0;/*flex布局内，保证自身大小不变*/
      justify-content: space-around;
      align-items: center;
      height: var(--nav-height);
      width: 100%;
      //background-color: red; /* 背景颜色，根据需要调整 */
      overflow-y: hidden;
      //-webkit-overflow-scrolling: touch; /* 启用触摸滚动 */
      //touch-action: manipulation; /* 只允许点击，禁止滚动和缩放 */
    }
    .o_nav::-webkit-scrollbar {
      width: 0; /* 隐藏垂直滚动条 */
    }
    .o_nav::-webkit-scrollbar-thumb {
      background-color: transparent; /* 滚动条的拖动部分背景色设为透明 */
    }
    .o_nav_button {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      //padding: 5px;
      //background-color: #3498db;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      min-width: 80px;
      height: 100%;
      // margin: 10px 10px 10px 10px;
      color: ${this.config.color || "var(--primary-color)"};
    }

    .o_nav_button ha-icon {
      color: inherit;
      margin-bottom: 1px;
      width: auto;
      height: auto;
      --mdc-icon-size: ${this.config.navFontSize*1.5 + "px"};
      display: ${this.config.showIcon? "block" : "none"};
    }
    
    .o_nav_button .o_nav_text {
      font-size: ${ this.config.navFontSize + "px" || "14px"};
      margin-bottom: auto;
      margin-top: auto;
      color: inherit;
    }
    
    .o_nav_button:active {
      transform: scale(0.9);
    }

    @media screen and (orientation: landscape) {  /* 媒体查询，横屏样式 */
      :host { 
       
        /*min-height: 100vh;*/
      }
      .o_nav {

        
        justify-content: space-evenly;
      }
      .o_nav_button {
        margin: 10px 5px 10px 15px;
      }
      .o_body {     
        /*min-height: calc(100vh - ${subNavHeight}px + 2px);*/
      }
    }
  `;

    this.shadow.appendChild(style);
    if(this.config.cards.length > 1){
      this.shadow.appendChild(o_nav);
    }
    this.shadow.appendChild(o_body);
    
    // console.timeEnd('render');
    // console.log("render-end");
  }

  // 创建点击事件处理函数
  handleNavClick = (event) => {    
      const o_nav_button_arr = this.shadow.querySelectorAll(".o_nav_button");
      o_nav_button_arr.forEach((element)=>{
        element.style.color = this.config.color || "var(--primary-color)";

      });
      event.currentTarget.style.color = this.config.activeColor || "rgba(var(--primary-color), 0.1)" || "var(--state-icon-color)";

      //scroll设置
      const hashValue = event.currentTarget.dataset.hash;
      const hashValueArr = hashValue.split("-");
      // const elementsWithDataCardPathName = this.shadow.querySelectorAll(
      //   "[data-mainPathName]"
      // );
      const o_body = this.shadow.querySelector(".o_body");
      const cardsArr = o_body.children;
      requestAnimationFrame(() => {
        Array.from(cardsArr).forEach((card, index) => {
          if (card.getAttribute("data-mainPathName")) {
            let tagArr = card.getAttribute("data-mainPathName").split("/"); 
            const isStringInArray = tagArr.includes(hashValue);
            if (isStringInArray) {
              card.style.display = "";
            } else {
              // this.shadow.scrollIntoView({ behavior: 'smooth', block: 'start' });
              card.style.display = "none";
            }
          } else {
            // o_body.scrollTop = o_body.scrollTop - card.offsetHeight;
            // this.shadow.scrollIntoView({ behavior: 'smooth', block: 'start' });
            card.style.display = "none";
          }
        
        });
        // this.shadow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // o_body.scrollTop = 0;  //回到初始位置 
      });
      // this.dispatchEvent(eventObj);  
  };

  handleTitleClick = (event, path) => {
    // 按钮触发样式
   
      // const o_nav_button_arr = event.currentTarget.parentNode.childNodes;
      // Array.from(o_nav_button_arr).forEach((element) => {
      //   element.style.color =
      //     this.llConfig.o_header.color || "var(--primary-color)";
      // });
      // event.currentTarget.style.color =
      //   this.llConfig.o_header.activeColor || "var(--state-icon-color)";
      //设置切换前的scrolltop值

      // console.log("触发前", this.scrollTopArr[this.viewIndex]);
      //切换页面
      // console.log("click");
      this.navigateToPath(path);
  }
  //路径导航 replace作用是选择替换和增加历史记录
  navigateToPath(path, replace = false) {
    // console.log("path",path);
    if (replace) {
      history.replaceState(null, "", path);
    } else {
      history.pushState(null, "", path);
    }
    const event = new Event("location-changed");
    window.dispatchEvent(event);
  }

  async createCardElement(cardConfig) {
    const createError = (error, origConfig) => {
      return createThing("hui-error-card", {
        type: "error",
        error,
        origConfig,
      });
    };
    const createThing = (tag, config) => {
      //新版的创建card方法
      if (this.helpers) {
        if (config.type === "divider") {
          return this.helpers.createRowElement(config);
        } else {
          return this.helpers.createCardElement(config);
        }
      }
      //旧版的创建card方法
      const element = document.createElement(tag);
      try {
        element.setConfig(config);
      } catch (err) {
        console.error(tag, err);
        return createError(err.message, config);
      }
      return element;
    };
    let tag = cardConfig.type;
    if (tag.startsWith("divider")) {
      tag = `hui-divider-row`;
    } else if (tag.startsWith("custom:")) {
      tag = tag.substr("custom:".length);
    } else {
      tag = `hui-${tag}-card`;
    }

    const element = createThing(tag, cardConfig);
    element.hass = this._hass;
    return element;
  }

  handleLocationChanged = (event) => {
    if(this.baseURI.indexOf(this.lovelace.lovelace.urlPath) != -1){
      // console.log("window.location.hash",window.location.hash);
      const elementWithHassData = this.shadow.querySelectorAll('[data-hash]');
      elementWithHassData.forEach(element => {
        if (element && element.dataset.hash == window.location.hash) {
          // 找到了具有 data-hass="#home" 的元素
          // console.log(elementWithHassData);
          // console.log("elementWithHassData.dataset.hash",element.dataset.hash);
          element.style.display = "block";
        } else {
          // 没有找到匹配的元素
          // console.log('未找到匹配的元素');
        }
      });
      
      /*
      Array.from(this.shadow.children).forEach((element)=>{
        if(element.data-hass == window.location.hash){
          element.style.display = "flex";
        }
      });
      // 获取当前路径
      console.log(
        "event location-changed trigger" + this.idCounter,
        window.location
      );*/
    }
  };
}

TapAndSwitchCards.eventListenerAdded = false; //事件添加标记  防止重复添加
TapAndSwitchCards.idCounter = 0;


setTimeout(()=>{
  customElements.whenDefined("hui-view").then(() => {
    customElements.define('tap-and-switch-cards',TapAndSwitchCards);
    // Overly complicated console tag.
  const conInfo = { header: "%c≡ tap-and-switch-cards".padEnd(27), ver: "%cversion *DEV " };
  const br = "%c\n";
  const maxLen = Math.max(...Object.values(conInfo).map((el) => el.length));
  for (const [key] of Object.entries(conInfo)) {
    if (conInfo[key].length <= maxLen) conInfo[key] = conInfo[key].padEnd(maxLen);
    if (key == "header") conInfo[key] = `${conInfo[key].slice(0, -1)}⋮ `;
  }
  const header =
    "display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;";
  const info = "border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";
  console.info(conInfo.header + br + conInfo.ver, header, "", `${header} ${info}`);
  });
},0);


// customElements.define('oubo-test-card',TapAndSwitchCards);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tap-and-switch-cards",
  name: "tap-and-switch-cards",
  preview: false, // Optional - defaults to false
  description: "通过按钮点击切换需要显示的卡片" ,// Optional
});

