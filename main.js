class Node extends HTMLElement {
  constructor(sharedCSS = null) {
    super()

    this._vt = new Map();
    this._vt.set('mobile', new Map());
    this._vt.set('desktop', new Map());
    this.attachShadow({mode: 'open'})

    if(sharedCSS) {
      const externalCSS = document.createElement('link');
      externalCSS.setAttribute('rel', 'stylesheet');
      externalCSS.setAttribute('href', sharedCSS);
      this.shadowRoot.appendChild(externalCSS);
    }

    if(this.resizeCallback)
      addWindowResizeEvent(this, this.resizeCallback)
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

class InfoTable extends Node {
  constructor() {
    super('common.css');

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
    super('common.css');
    
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

      .headline {
        margin-top: 1rem;
        display: flex;
        align-items: center;
      }

      .title {
        margin-right: 1rem;
      }

      .link, .title {
        font-weight: 700 !important;
        text-transform: uppercase;
        word-spacing: -0.4rem;
      }

      .description {
        margin: 1rem 0rem;
        text-align: justify;
      }

      .footer {
        display: flex;
        align-items: center;
      }

      .link {
        margin-left: 1rem;
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

    addWindowResizeEvent(this, () => this.resizeCallback());

    this.shadowRoot.append(style, this._carouselContainer, this._pagination);
  } 

  connectedCallback() {
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

  resizeCallback() {
    this._setPagination(this.mode);
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

  addItem(imgSrc, titleLabel, descContent, linkHref) {
    const itemContainer = document.createElement('div');
    const figure = document.createElement('figure');
    const figureImg = document.createElement('img');
    const headline = document.createElement('div');
    const title = document.createElement('h2');
    const hline = document.createElement('span');
    const description = document.createElement('p');
    const footer = document.createElement('div');
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

    headline.setAttribute('class', 'headline')
    headline.append(title, hline)
    title.setAttribute('class', 'title');
    title.textContent = titleLabel;
    hline.setAttribute('class', 'hline');

    description.textContent = descContent;
    description.setAttribute('class', 'description')

    footer.setAttribute('class', 'footer');
    const fline = hline.cloneNode(true);
    link.setAttribute('href', linkHref);
    link.setAttribute('class', 'link');
    link.textContent = "read more";
    footer.append(fline, link);

    itemContainer.setAttribute('class', 'carousel-item');
    itemContainer.append(figure, headline, description, footer);

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
  return document.documentElement.scrollWidth;
}

function getViewportHeight() {
  return document.documentElement.scrollHeight;
}
