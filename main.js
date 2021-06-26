class Node extends HTMLElement {
  constructor() {
    super()

    const sharedCSS = this.getAttribute('data-style-href');
    this._vt = new Map();
    this._vt.set('mobile', new Map());
    this._vt.set('desktop', new Map());
    this.attachShadow({mode: 'open'});

    if(sharedCSS) {
      const externalCSS = document.createElement('link');
      externalCSS.setAttribute('rel', 'stylesheet');
      externalCSS.setAttribute('href', sharedCSS);
      this.shadowRoot.appendChild(externalCSS);
    }

    if(this._onwindowResize)
      addWindowResizeEvent(this, () => this._onwindowResize())
  }

  connectedCallback() {
    if(this.isConnected) {
      let duplicateParentCSS = this.getAttribute('data-duplicate-styles');

      if(this._onready)
        this._onready();

      if(duplicateParentCSS) {
        let DOMRoot = this.getRootNode();
        for(const style of DOMRoot.styleSheets) 
          this.shadowRoot.insertBefore(style.ownerNode.cloneNode(true), this.shadowRoot.firstChild)
      }
    }
  }

  _virtualize(id, element) {
    this._vt.get('mobile').set(id, element.cloneNode(true));
    this._vt.get('desktop').set(id, element.cloneNode(true));
  }

  _getVt(media) {
    return this._vt.get(media);
  }

  _getVtElement(id, media) {
    return this._getVt(media).get(id);
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

    this._updateContent();
    this.shadowRoot.append(style, this.wrapper);
  }

  _onready() {
    this._updateContent();
  }

  _updateContent() {
    if(this.firstChild) {
      const direction = this.getAttribute('data-direction');
      const gap = this.getAttribute('data-gap') ? this.getAttribute('data-gap') : "20px";
      this.firstChild.style.textTransform = "uppercase";

      if(direction == "right") {
        this.firstChild.style.marginLeft = gap;
        this.wrapper.append(this.hline, this.firstChild);
      }
      else {
        this.firstChild.style.marginRight = gap;
        this.wrapper.append(this.firstChild, this.hline);
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
    this._virtualize('pagination', this._pagination);

    for (let x = 0; x < 5; ++x) // temp
      this.addItem(`https://via.placeholder.com/300x300`, "Lorem Ipsum", 
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
    let pagination = this._getVtElement('pagination', media);
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
    link.textContent = "WAAA";
    fline.setAttribute('data-duplicate-styles', true);
    fline.setAttribute('data-direction', 'right');
    fline.appendChild(link);

    itemContainer.setAttribute('class', 'carousel-item');
    itemContainer.append(figure, hline, description, fline);

    page.setAttribute('class', 'page');
    page.onclick = pageClickHandle;

    this._getVtElement('pagination', 'mobile').appendChild(page);

    if(this.carouselItems.length % 2 == 0) {
      let pageClone = page.cloneNode(true);
      pageClone.onclick = pageClickHandle;
      this._getVtElement('pagination', 'desktop').appendChild(pageClone);
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
var addWindowResizeEvent = (() => {
  const callbackMap = new Map();

  const runAllCallbacks = (f, elem) => f(elem);

  return (element, callback) => { 
    callbackMap.set(element, callback);
    window.onresize = () => callbackMap.forEach(runAllCallbacks);
  };
})();

terminalResolution.textContent = `${getViewportWidth()}x${getViewportHeight()}`;
customElements.define('h-line', HorizontalLine);
customElements.define('info-table', InfoTable);
customElements.define('carousel-timeline', CarouselTimeline);

addWindowResizeEvent(terminalResolution, elem => {
  elem.textContent = `${getViewportWidth()}x${getViewportHeight()}`;
});

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
