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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@polymer/paper-item/paper-icon-item.js';
import '../../@polymer/paper-item/paper-item-body.js';
import '../../@polymer/paper-ripple/paper-ripple.js';
import '../../@advanced-rest-client/requests-list-mixin/requests-list-styles.js';
import '../../@polymer/iron-list/iron-list.js';
import '../../@api-components/http-method-label/http-method-label.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-checkbox/paper-checkbox.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
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
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 */
class SavedPanelList extends PolymerElement {
  static get template() {
    return html`
    <style include="requests-list-styles">
    :host {
      display: block;
      position: relative;
      --paper-item-icon-width: 56px;
      @apply --arc-font-body1;
      @apply --layout-flex;
      @apply --layout-vertical;
    };

    iron-list {
      flex: 1 1 auto;
    }

    .url {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 14px;
    }

    .drop-message {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(255, 255, 255, 0.84);
      z-index: 10;
      @apply --layout-center-center;
      @apply --arc-font-body1;
      color: var(--primary-color);
      border: 2px var(--primary-color) dashed;
      font-size: 18px;
    }

    .drop-icon {
      width: 72px;
      height: 72px;
    }

    :host(.drop-target) .drop-message {
      @apply --layout-vertical;
    }
    </style>
    <div class="drop-message">
      <iron-icon icon="arc:save-alt" class="drop-icon"></iron-icon>
      <p>Drop request here</p>
    </div>
    <iron-list items="[[requests]]" id="list" selected-items="{{selectedItems}}" multi-selection="">
      <template>
        <div data-index\$="[[index]]" class\$="request-list-item [[_computeRowClass(selected)]]">
          <paper-icon-item
            on-click="_toggleSelection"
            tabindex\$="[[tabIndex]]"
            aria-label\$="Select/Deselect [[item.url]]"
            class="request-list-item"
            draggable\$="[[_computeDraggableValue(draggableEnabled)]]"
            on-dragstart="_dragStart">
            <paper-checkbox slot="item-icon" checked="{{selected}}"></paper-checkbox>
            <http-method-label method="[[item.method]]"></http-method-label>
            <paper-item-body two-line\$="[[hasTwoLines]]">
              <div class="url select-text">[[item.url]]</div>
              <div secondary="" class="item-details">
                <span class="name select-text">[[item.name]]</span>
              </div>
              <paper-ripple></paper-ripple>
            </paper-item-body>
            <paper-button
              class="list-action-button list-secondary-action"
              data-action="item-detail"
              on-click="_requestDetails">Details</paper-button>
            <paper-button
              class="list-action-button list-main-action"
              data-action="open-item"
              on-click="_navigateItem"
              raised="">Open</paper-button>
          </paper-icon-item>
        </div>
      </template>
    </iron-list>
    <iron-scroll-threshold
      id="scrollTheshold"
      lower-threshold="[[threshold]]"
      on-lower-threshold="_thresholdHandler"
      scroll-target="[[_scrollTarget]]"></iron-scroll-threshold>
`;
  }

  static get properties() {
    return {
      requests: Array,
      /**
       * A list lower treshold when the `history-list-threshold` will be
       * fired. It should informa the app that the user nearly reached
       * the end of the list and new items should be loaded.
       */
      threshold: {
        type: Number,
        value: 120
      },
      /**
       * Scroll target for `iron-scroll-threshold`.
       * This is set in connectedCallback as the DOM has to be initialized
       * before setting this property.
       * @type {Element}
       */
      _scrollTarget: Object,
      // List of selected items on the list.
      selectedItems: {
        type: Array,
        notify: true
      },
      /**
       * When set the list items are rendered having 2 lines.
       * @type {Boolean}
       */
      hasTwoLines: Boolean,
      /**
       * Adds draggable property to the request list item element.
       * The `dataTransfer` object has `arc/request-object` mime type with
       * serialized JSON with request model.
       */
      draggableEnabled: {type: Boolean, value: false, observer: '_draggableChanged'}
    };
  }

  static get observers() {
    return ['_requestsChanged(requests.*)'];
  }

  constructor() {
    super();
    this._dragoverHandler = this._dragoverHandler.bind(this);
    this._dragleaveHandler = this._dragleaveHandler.bind(this);
    this._dropHandler = this._dropHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._scrollTarget = this.$.list;
    if (this.draggableEnabled) {
      this._addDndEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._scrollTarget = undefined;
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
   * Notifies the list that the resize event occurred.
   * Should be called whhen content of the list changed but the list wasn't
   * visible at the time.
   */
  notifyResize() {
    this.$.list.notifyResize();
  }

  _thresholdHandler(e) {
    if (this.__ignoreTreshold) {
      e.target.clearTriggers();
      return;
    }
    const r = this.requests;
    if (!r || !r.length) {
      return;
    }
    this.dispatchEvent(new CustomEvent('list-items-threshold'));
  }

  _requestsChanged(record) {
    if (!this.__ignoreTreshold && record &&
      (record.path === 'requests.length' || record.path === 'requests')) {
      this.$.scrollTheshold.clearTriggers();
      this.__ignoreTreshold = true;
      afterNextRender(this, () => {
        this.__ignoreTreshold = false;
      });
    }
  }

  _requestDetails(e) {
    e.preventDefault();
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('list-item-details', {
      detail: {
        request: e.model.get('item')
      }
    }));
  }

  _navigateItem(e) {
    e.preventDefault();
    e.stopPropagation();

    const id = e.model.get('item._id');
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        base: 'request',
        type: 'saved',
        id
      }
    }));
  }

  _toggleSelection(e) {
    this.$.list.toggleSelectionForIndex(e.model.get('index'));
  }

  /**
   * Computes list item row class
   * @param {Boolean} selected True if the item was selected
   * @return {String} Item class name dependeing on selection state
   */
  _computeRowClass(selected) {
    return selected ? 'iron-selected' : '';
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
    const request = e.model.get('item');
    const data = JSON.stringify(request);
    e.dataTransfer.setData('arc/request-object', data);
    e.dataTransfer.setData('arc/saved-request', request._id);
    e.dataTransfer.setData('arc-source/saved-panel', request._id);
    e.dataTransfer.effectAllowed = 'copy';
  }
  /**
   * Computes value for the `draggable` property of the list item.
   * When `draggableEnabled` is set it returns true which is one of the
   * conditions to enable drag and drop on an element.
   * @param {Boolean} draggableEnabled Current value of `draggableEnabled`
   * @return {String} `true` or `false` (as string) depending on the argument.
   */
  _computeDraggableValue(draggableEnabled) {
    return draggableEnabled ? 'true' : 'false';
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
window.customElements.define('saved-panel-list', SavedPanelList);
