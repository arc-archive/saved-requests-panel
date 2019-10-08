/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html, css } from 'lit-element';
import { HistoryPanelList } from '@advanced-rest-client/history-panel/src/HistoryPanelList.js';
import '@advanced-rest-client/history-panel/history-panel-list.js';
import { saveAlt } from '@advanced-rest-client/arc-icons/ArcIcons.js';
/**
 * `saved-panel-list`
 *
 * ## Styling
 *
 * `<saved-panel-list>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--saved-panel-list` | Mixin applied to this elment | `{}`
 * `--saved-panel-list-url-label` | Mixin applied to the list container | `{}`
 * `--saved-panel-list-secondary-action-color` | Color of the secondary action button | `--primary-color`
 * `--saved-panel-list-url-label` | Mixin applied to the URL label | `{}`
 * `--saved-panel-list-method-label` | Mixin applied to the method label | `{}`
 *
 * @customElement
 * @demo demo/index.html
 * @memberof ApiElements
 */
export class SavedPanelList extends HistoryPanelList {
  static get styles() {
    return [
      HistoryPanelList.styles,
      css`
      .drop-message {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.84);
        z-index: 10;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        border: 2px var(--primary-color) dashed;
        font-size: 18px;
      }

      .drop-icon {
        width: 72px;
        height: 72px;
        display: inline-block;
        fill: currentColor;
      }

      :host(.drop-target) .drop-message {
        display: flex;
        flex-direction: column;
      }
      `
    ];
  }

  _dropTargetTemplate() {
    return html`<div class="drop-message">
      <span class="drop-icon">${saveAlt}</span>
      <p>Drop request here</p>
    </div>`;
  }

  _listItemDetailsTemplate(item) {
    return html`<div class="url">${item.url}</div>
    <div secondary class="item-details">
      <span class="name select-text">${item.name}</span>
    </div>`;
  }

  render() {
    return html`
    ${this._dropTargetTemplate()}
    ${super.render()}`;
  }

  get draggableEnabled() {
    return this._draggableEnabled;
  }

  set draggableEnabled(value) {
    const old = this._draggableEnabled;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._draggableEnabled = value;
    this._draggableChanged(value);
  }

  constructor() {
    super();
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._removeDndEvents();
  }

  _draggableChanged(value) {
    if (value) {
      this._addDndEvents();
    } else {
      this._removeDndEvents();
    }
  }

  _addDndEvents() {
    if (this.__dndAdded) {
      return;
    }
    this.__dndAdded = true;
    this.addEventListener('dragover', this._dragoverHandler);
    this.addEventListener('dragleave', this._dragleaveHandler);
    this.addEventListener('drop', this._dropHandler);
  }

  _removeDndEvents() {
    if (!this.__dndAdded) {
      return;
    }
    this.__dndAdded = false;
    this.removeEventListener('dragover', this._dragoverHandler);
    this.removeEventListener('dragleave', this._dragleaveHandler);
    this.removeEventListener('drop', this._dropHandler);
  }

  /**
   * Handler for the `dragstart` event added to the list item when `draggableEnabled`
   * is set to true.
   * This function sets request data on the `dataTransfer` object with `arc/request-object`
   * mime type. The request data is a serialized JSON with request model.
   * @param {Event} e
   */
  _dragStart(e) {
    if (!this.draggableEnabled) {
      return;
    }
    const index = Number(e.currentTarget.dataset.index);
    const request = this.requests[index];
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/saved-request', request._id);
    e.dataTransfer.setData('arc-source/saved-panel', request._id);
    e.dataTransfer.effectAllowed = 'copy';
  }
  /**
   * Handler for `dragover` event on this element. If the dagged item is compatible
   * it renders drop message.
   * @param {DragEvent} e
   */
  _dragoverHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
    if (!this.classList.contains('drop-target')) {
      /* eslint-disable wc/no-self-class */
      this.classList.add('drop-target');
    }
  }
  /**
   * Handler for `dragleave` event on this element. If the dagged item is compatible
   * it hides drop message.
   * @param {DragEvent} e
   */
  _dragleaveHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.preventDefault();
    if (this.classList.contains('drop-target')) {
      this.classList.remove('drop-target');
    }
  }
  /**
   * Handler for `drag` event on this element. If the dagged item is compatible
   * it adds request to saved requests.
   * @param {DragEvent} e
   */
  _dropHandler(e) {
    if (!this.draggableEnabled) {
      return;
    }
    if (e.dataTransfer.types.indexOf('arc/request-object') === -1 ||
      e.dataTransfer.types.indexOf('arc/saved-request') !== -1) {
      return;
    }
    e.preventDefault();
    if (this.classList.contains('drop-target')) {
      this.classList.remove('drop-target');
    }
    const data = e.dataTransfer.getData('arc/request-object');
    if (!data) {
      return;
    }
    const request = JSON.parse(data);
    this._appendRequest(request);
  }
  /**
   * Dispatches (by calling `_dispatch() function`) `save-request` event
   * which is handled by request model to create new request.
   * The function do not need to do anything else since request change listeners
   * will insert the request to the list when saved.
   * @param {Object} request The request to store.
   * @return {CustomEvent}
   */
  _appendRequest(request) {
    delete request._rev;
    delete request._id;
    delete request.timeLabel;
    delete request.dayTime;
    delete request.hasHeader;
    delete request.header;
    if (!request.name) {
      request.name = 'Unnamed';
    }
    const e = new CustomEvent('save-request', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        request
      }
    });
    this.dispatchEvent(e);
    return e;
  }
}
