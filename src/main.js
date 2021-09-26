import PortfolioThumbnail from './portfolio_thumbnail.png';
import ChessPizzaThumbnail from './chessPizza_thumbnail.png';
import SecurityPlusThumbnail from './securityPlus_thumbnail.png';
import SurverDataGeneratorThumbnail from './surveyDataGenerator_thumbnail.png';
import PrimeGeneratorThumbnail from './primeGenerator_thumbnail.png';

class Node extends HTMLElement {
  constructor() {
    super()

    this._vt = new Map();
    this._viacc = 0;
    this._bootstraped = false;
    this.attachShadow({mode: 'open'});

    if(this._onwindowResize)
      addWindowEvent('resize', () => this._onwindowResize())

    if(this.parentNode)
      this.bootstrapCallback()
  }

  // This callback is a wrapper for when the code should be called once either on construction or when connected to a document.
  // This wrapper is a workaround when instantiating custom element using document.createElement and assigning it to a variable
  // which will run the construction code when it hasn't been attached to a document, making dependant logic on parent properties
  // to not run.
  bootstrapCallback() {
    if(!this._bootstraped) {
      //duplicate the root document stylesheets.
      const duplicateStyles = this.getAttribute('data-duplicate-styles');
      //create external css
      const sharedCSS = this.getAttribute('data-style-href');

      //duplicated stylesheets will not create bloat, as browsers will optimize same <style> rules.
      if(duplicateStyles) {
        let DOMRoot = this.getRootNode();
        let styleSheets = DOMRoot.styleSheets;
        let length = DOMRoot.styleSheets.length;
        let shadowRoot = this.shadowRoot;
        let duplicatedSheets = [];

        for(let i = 0; i < length; ++i) {
          duplicatedSheets.push(styleSheets[i].ownerNode.cloneNode(true));
          shadowRoot.insertBefore(styleSheets[length - i - 1].ownerNode.cloneNode(true), shadowRoot.firstElementChild)
        };
      }

      if(sharedCSS) {
        const externalCSS = document.createElement('link');
        externalCSS.setAttribute('rel', 'stylesheet');
        externalCSS.setAttribute('href', sharedCSS);
        this.shadowRoot.appendChild(externalCSS);
      }

      this._bootstraped = true;
    }
  }

  connectedCallback() {
    if(!this.isConnected)
      return
    
    if(this.parentNode)
      this.bootstrapCallback()

    if(this._onready)
      this._onready();
  }

  // Attach a virtual tree for the element
  _virtualize(element, mediaList = ['mobile', 'desktop']) {
    // Each media represent the element version for that media
    let virtualId = element.getAttribute('data-vi') ? element.getAttribute('data-vi') : this._viacc++;

    element.setAttribute('data-vi', virtualId);

    mediaList.forEach(media => {
      if(!this._vt.has(media))
        this._vt.set(media, new Map());

      this._vt.get(media).set(virtualId, element.cloneNode(true));
    });
  }

  _getVt(media) {
    return this._vt.get(media);
  }

  _getVtElement(element, media) {
    return this._getVt(media).get(parseInt(element.getAttribute('data-vi')));
  }
}

class HorizontalLine extends Node {
  constructor() {
    super();

    const style = document.createElement('style');
    this.hline = document.createElement('span');
    this.wrapper = document.createElement('div');
    this.hline.setAttribute('class', 'hline');

    style.textContent = `
      div {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .hline {
        border: 2px solid #6D8086;
        flex-grow: 1;
      } 
    `;  

    if(!this._updated)
      this._updateContent();
    this.shadowRoot.append(style, this.wrapper);
  }

  _onready() {
    if(!this._updated)
      this._updateContent();
  }

  _updateContent() {
    if(this.firstElementChild) {
      this._updated = true;
      const direction = this.getAttribute('data-direction');
      const gap = this.getAttribute('data-gap') ? this.getAttribute('data-gap') : "20px";
      this.firstElementChild.style.textTransform = "uppercase";

      if(direction == "right") {
        this.firstElementChild.style.marginLeft = gap;
        this.wrapper.append(this.hline, this.firstElementChild);
      }
      else {
        this.firstElementChild.style.marginRight = gap;
        this.wrapper.append(this.firstElementChild, this.hline);
      }

    } else {
      this.wrapper.appendChild(this.hline);
    }
  }
}

class InfoTable extends Node {
  constructor() {
    super();

    const table = document.createElement('table');
    const colgroup = document.createElement('colgroup');

    const style = document.createElement('style');   
    const labelColor = '#519ABA';
    const seperatorColor = '#436B24';

    const nameRow = this._createInfoRow("NAME", "MUHAMMAD RAZNAN");
    const emailRow = this._createInfoRow("EMAIL", "***********@**********.com");
    const githubRow = document.createElement('a').appendChild(this._createInfoRow('GITHUB', "https://github.com/scr1pti3"));

    style.textContent = `
      table {
        border-collapse: collapse;
        width: 100%;
      }

      .label { 
        width: 100px;
        color: ${labelColor}
      }
      .seperator {
        width: 30px;
        color: ${seperatorColor}
      }
    `;

    table.append(colgroup, nameRow, emailRow, githubRow);

    this.shadowRoot.append(style, table)
  }

  _createInfoRow(label, value) {
    let trElement = document.createElement('tr');

    let labelElement = document.createElement('td');
    let seperatorElement = document.createElement('td');
    let textElement = document.createElement('td');

    labelElement.setAttribute('class', 'label');
    seperatorElement.setAttribute('class', 'seperator');
    textElement.setAttribute('class', 'text');

    labelElement.innerHTML = label;
    seperatorElement.innerHTML = "|";
    textElement.innerHTML = value;

    trElement.append(labelElement, seperatorElement, textElement);

    return trElement;
  }
}

class CarouselTimeline extends Node {
  constructor() {
    super();

    const style = document.createElement('style');   
    const fontColor = '#6D8086';

    this.currentPage = 1;
    this.carouselItems = [];
    this._carouselItemGap = 50;                      // in pixels

    this._carouselContainer = document.createElement('div');
    this._carouselItemContainer = document.createElement('div');
    this._pagination = document.createElement('div');
    this._pagination.setAttribute('class', 'pagination');
    this._virtualize(this._pagination);


    this.addItem(PortfolioThumbnail, "About Me Page",
      `This is the same page that you are currently on. I made it from scratch using Web components, pure CSS and HTML for the front-end. The back-end is also made from scratch, and the page is hosted using a VPS. I have made the source code for the front-end available in my Github repo, tho the back-end is not open for the public.`,
      "https://github.com/scr1pti3/portfolio"
    );

    this.addItem(ChessPizzaThumbnail, "Chess Pizza",
      `CHESS Pizza is a 2D, pixel art, top-down, horror-adventure game, where you try to save your pizzeria by making gross pizzas for an unknown customer. The game was made in collaboration with other wonderful people, my role was as a programmer. You can check out more about this game by pressing the read more button below.`,
      "https://atumsk.itch.io/chess-pizza"
    );

    this.addItem(SecurityPlusThumbnail, "CompTIA Security+ Certificate",
      `I took this certificate some time ago when Covid was starting to ruin my college experience. Due to me being bored at home doing online classes, I took it upon myself to study the certification exam objectives, then I scheduled for the exam. Now here I am with this certificate for no reason at all :-)`, 
      'https://www.credly.com/badges/96265fe8-590e-45b2-99f4-4b122c8ef8bf'
    );

    this.addItem(SurverDataGeneratorThumbnail, "Survey Data Generator",
    `I actually don't know what this is supposed to be lol. It just happen that a friend of mine needed some sample data for their survey or whatever, so to help them, I made this thing in like 2 day~ish. Haha. It uses IndexDB for persistent storage cuz I'm too lazy to implement a real database. At the end of the day, it works, I guess. Also, the source code is available in my Github repo.`,
    'https://scr1pti3.github.io/survey-data-generator/');

    this.addItem(PrimeGeneratorThumbnail, "Prime Generator",
    `This little project is self-explanatory. It generates prime numbers. I made this when I was working with my professor for his Journal since we needed some quick prime numbers. That's all there is to is, it just generates prime numbers that end with either {1,3,7,9}. The source code is available in my Github repo.`, 
    "https://scr1pti3.github.io/prime-generator/");

    for (let x = 0; x < 2; ++x) // temp
      this.addItem(`https://via.placeholder.com/1920x1080`, "Lorem Ipsum", 
        `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
        when an unknown printer took a galley of type and scrambled it to make a type specimen book.`
      );

    style.textContent = `
      .no-select {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
      }

      .carousel-container {
        margin: inherit;
        margin-bottom: 0px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .item-container {
        position: relative; 
        display: flex;
        gap: ${this._carouselItemGap}px;
      }

      .carousel-item {
        transition: all 1s;
        min-width: 100%; 
      }

      .carousel-item img {
          width: 100%;
          height: 40vh;
       }

      .description {
        margin: 1rem 0rem;
        text-align: justify;
      }

      .link {
        font-weight: 700 !important;
        text-decoration: none;
        transition: color 600ms ease-out;
      }

      .link:hover {
        color: #CBCB41;
      }

      .pagination {
        margin-top: 50px;
        display: flex;
        gap: 20px; 
        align-items: center;
        justify-content: center;
      }

      .page {
        background-color: #6D8086;
        width: 50px;
        height: 20px;
        border-width: 0px;
        cursor: pointer;
      }

      .page-active {
        background-color: #CBCB41;
      }

      .sliding {
        transition: left .2s ease-out;
      }

      @media only screen and (min-width: ${minDesktopWidth}px) {
        .carousel-item {
          min-width: calc((100% - ${this._carouselItemGap}px) / 2 );
        } 
      }
    `;

    this._carouselItemContainer.setAttribute('class', 'item-container no-select');
    this._carouselItemContainer.style.left = "0px";
    this._carouselContainer.appendChild(this._carouselItemContainer);
    this._carouselContainer.setAttribute('class', 'carousel-container no-select');

    this.shadowRoot.append(style, this._carouselContainer, this._pagination);
  } 

  _onready() {
    let itemContainer = this._carouselItemContainer;
    let offsetInitial = itemContainer.offsetLeft; 
    let mouseV1 = 0;
    let mouseV2 = 0;
    let slideInitial = 0;
    let slideTerminal = 0;

    var dragStart = (ed) => {
      ed.preventDefault();
      if (!this.isSliding()) {
        slideInitial = itemContainer.offsetLeft;
        this._carouselContainer.onmousemove = dragMove;
        this._carouselContainer.onmouseup = dragEnd; 
        this._carouselContainer.onmouseleave = dragEnd;

        mouseV1 = ed.clientX;
        mouseV2 = 0;
      }
    }

    var dragMove = (em) => {
      mouseV2 = mouseV1 - em.clientX;
      mouseV1 = em.clientX;
      itemContainer.style.left = `${itemContainer.offsetLeft - mouseV2}px`;
    }

    var dragEnd = (e) => {
      slideTerminal = itemContainer.offsetLeft; 
      let distance = slideTerminal - slideInitial;

      let dir = Math.sign(distance);
      let targetPage = Math.abs(distance) > this.threshold ? clamp(this.currentPage + dir * -1, 1, this.totalPage) : this.currentPage;

      this._carouselContainer.onmousemove = null;
      this._carouselContainer.onmouseleave = null;

      if(dir)
        if(targetPage == this.currentPage) 
          this._slide(slideInitial);
      else 
        this.changePage(targetPage, distance);
    }

    this._carouselItemSize = this._carouselItemContainer.firstElementChild.clientWidth;
    this._setPagination(this.mode);
    this._carouselContainer.onmousedown = dragStart;
    this._carouselContainer.ontouchstart = dragStart;
    this._carouselContainer.ontouchend = dragEnd;


    itemContainer.addEventListener('transitionend', () => {
      itemContainer.classList.remove("sliding");
      slideInitial = itemContainer.offsetLeft;
    }
    );
  }

  _onwindowResize() {
    this._setPagination(this.mode);
  }

  _setPagination(media) {
    if(this.currentPage > 1)
      this._slide(0);

    let fragment = document.createDocumentFragment();
    let pagination = this._getVtElement(this._pagination, media);
    pagination.childNodes.forEach(page => page.classList.remove('page-active'));
    pagination.firstElementChild.classList.add('page-active');

    fragment.appendChild(this._pagination);
    fragment.replaceChildren(pagination);
    this._pagination = pagination;
    this.shadowRoot.appendChild(fragment);

    this.currentPage = 1;
  }

  _slide(pos) {
    this._carouselItemContainer.style.left = `${pos}px`;
    this._carouselItemContainer.classList.add('sliding');
  }

  get mode() {
    return isMediaDesktop() ? 'desktop': 'mobile';
  }

  get totalPage() {
    return this._pagination.childElementCount;
  }

  get threshold() {
    return this.parentNode.clientWidth * 0.17;
  }

  addItem(imgSrc, titleLabel, descContent, linkHref) {
    const itemContainer = document.createElement('div');
    const figure = document.createElement('figure');
    const figureImg = document.createElement('img');
    const title = document.createElement('h2');
    const description = document.createElement('p');
    const hline = document.createElement('h-line');
    const fline = document.createElement('h-line');
    const link = document.createElement('a');
    const page = document.createElement('button');

    const pageClickHandle = (e) => {
      let targetPage = Array.prototype.indexOf.call(this._pagination.children, e.currentTarget) + 1;
      if(this.currentPage != targetPage)
        this.changePage(targetPage);
    };

    figureImg.setAttribute('srcset', imgSrc);
    figureImg.onmousedown = e => e.preventDefault();
    figure.appendChild(figureImg);

    title.textContent = titleLabel;
    hline.setAttribute('data-duplicate-styles', true);
    hline.appendChild(title);

    description.textContent = descContent;
    description.setAttribute('class', 'description')

    link.setAttribute('href', linkHref);
    link.setAttribute('class', 'link');
    link.textContent = "read more";
    fline.setAttribute('data-duplicate-styles', true);
    fline.setAttribute('data-direction', 'right');
    fline.appendChild(link);

    itemContainer.setAttribute('class', 'carousel-item');
    itemContainer.append(figure, hline, description, fline);

    page.setAttribute('class', 'page');
    page.onclick = pageClickHandle;

    this._getVtElement(this._pagination, 'mobile').appendChild(page);

    if(this.carouselItems.length % 2 == 0) {
      let pageClone = page.cloneNode(true);
      pageClone.onclick = pageClickHandle;
      this._getVtElement(this._pagination, 'desktop').appendChild(pageClone);
    }

    this._carouselItemContainer.appendChild(itemContainer);
    this.carouselItems.push(itemContainer);
  }

  changePage(to, slideDelta = 0) {
    const from = this.currentPage;
    const pageWidth = this._carouselContainer.clientWidth;
    const distance = to - from;
    const totalGaps = this._carouselItemGap * distance;
    const offset = (distance * pageWidth + totalGaps + slideDelta) * -1;
    const fromPos = this._carouselItemContainer.offsetLeft; 
    const toPos = fromPos + offset; 

    this._slide(toPos);
    this._pagination.children[from - 1].classList.remove('page-active')
    this._pagination.children[to - 1].classList.add('page-active');
    this.currentPage = to;
  }

  isSliding() {
    return this._carouselItemContainer.classList.contains('sliding');
  }
}

var minDesktopWidth = 768; 
var terminalResolution = document.getElementById('terminal-resolution');
var addWindowEvent = (() => {
  const callbackMap = new Map();

  const runAllCallbacks = (f, vargs) => f(vargs);

  return (winEvent, callback, vargs) => { 
    callbackMap.set(vargs, callback);
    window.addEventListener(winEvent, () => callbackMap.forEach(runAllCallbacks))
  };
})();


customElements.define('h-line', HorizontalLine);
customElements.define('info-table', InfoTable);
customElements.define('carousel-timeline', CarouselTimeline);

window.onload = () => contentToScreenRect(terminalResolution);
addWindowEvent('resize', elem => contentToScreenRect(elem), terminalResolution);

function contentToScreenRect(elem) {
  elem.textContent = `${getViewportWidth()}x${getViewportHeight()}`;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function isMediaDesktop() {
  return getViewportWidth() >= minDesktopWidth;
}

function getViewportWidth() {
  return document.documentElement.clientWidth;
}

function getViewportHeight() {
  return document.documentElement.scrollHeight;
}
