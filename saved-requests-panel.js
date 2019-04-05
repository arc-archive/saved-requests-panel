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
import '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/iron-icon/iron-icon.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@polymer/paper-menu-button/paper-menu-button.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-listbox/paper-listbox.js';
import '../../@polymer/paper-item/paper-icon-item.js';
import '../../@polymer/paper-progress/paper-progress.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/paper-dialog/paper-dialog.js';
import '../../@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '../../@advanced-rest-client/saved-request-detail/saved-request-detail.js';
import '../../@advanced-rest-client/saved-request-editor/saved-request-editor.js';
import '../../@polymer/paper-fab/paper-fab.js';
import {RequestsListMixin} from '../../@advanced-rest-client/requests-list-mixin/requests-list-mixin.js';
import {ProjectsListConsumerMixin} from
  '../../@advanced-rest-client/projects-list-consumer-mixin/projects-list-consumer-mixin.js';
import '../../@advanced-rest-client/paper-chip-input/paper-chip-input.js';
import {SavedListMixin} from '../../@advanced-rest-client/saved-list-mixin/saved-list-mixin.js';
import '../../@advanced-rest-client/export-options/export-options.js';
import './saved-panel-list.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * Saved requests panel for ARC.
 *
 * Contains complete UI to support saved requests view.
 *
 * ### Styling
 *
 * `<saved-requests-panel>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--warning-primary-color` | Main color of the warning messages | `#FF7043`
 * `--warning-contrast-color` | Contrast color for the warning color | `#fff`
 * `--saved-requests-panel-fab-background-color` | Color of the fab button in the details panel | `--primary-color`
 * `--context-menu-item-color` | Color of the dropdown menu items | ``
 * `--context-menu-item-background-color` | Background olor of the dropdown menu items | ``
 * `--context-menu-item-color-hover` | Color of the dropdown menu items when hovering | ``
 * `--context-menu-item-background-color-hover` | Background olor of the dropdown menu items when hovering | ``
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin RequestsListMixin
 * @appliesMixin ProjectsListConsumerMixin
 * @appliesMixin SavedListMixin
 */
class SavedRequestsPanel extends SavedListMixin(ProjectsListConsumerMixin(
    RequestsListMixin(PolymerElement))) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      position: relative;
      @apply --arc-font-body1;
      @apply --layout-vertical;
      @apply --saved-requests-panel;
    }

    [hidden] {
      display: none !important;
    }

    .header {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    h2 {
      @apply --arc-font-headline;
      @apply --layout-flex;
    }

    h3 {
      @apply --arc-font-subhead;
    }

    .menu-item iron-icon {
      color: var(--context-menu-item-color);
    }

    .menu-item {
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
      cursor: pointer;
    }

    .menu-item:hover {
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }

    .menu-item:hover iron-icon {
      color: var(--context-menu-item-color-hover);
    }

    paper-progress {
      width: 100%;
      @apply --saved-requests-panel-loader;
    }

    saved-panel-list {
      overflow: auto;
    }

    .revert-button {
      height: 38px;
      @apply --saved-requests-panel-toast-revert-button;
    }

    #dataClearDialog {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    #dataClearDialog paper-button {
      color: var(--warning-dialog-button-color, #fff);
      background-color: var(--warning-dialog-button-background-color, transparent);
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
      @apply --error-toast;
    }

    .empty-info {
      font-size: 16px;
      @apply --empty-info;
    }

    .command {
      margin: 0 8px;
    }

    #requestDetailsContainer,
    #requestEditorContainer,
    #projectSelectorContainer,
    #exportOptionsContainer {
      width: var(--bottom-sheet-width, 100%);
      max-width: var(--bottom-sheet-max-width, 700px);
      right: var(--saved-requests-panel-bottom-sheet-right, 40px);
      left: var(--saved-requests-panel-bottom-sheet-left, auto);
      @apply --saved-requests-panel-bottom-sheet;
    }

    #requestDetailsContainer paper-fab {
      position: absolute;
      right: 16px;
      top: -28px;
    }

    #requestDetailsContainer paper-fab {
      --paper-fab-background: var(--saved-requests-panel-fab-background-color, var(--primary-color));
    }

    .project-actions {
      @apply --layout-horizontal;
      @apply --layout-end-justified;
      margin-top: 20px;
    }

    .selection-options {
      @apply --layout-horizontal;
      @apply --layout-center;
      height: 56px;
    }

    .spacer {
      @apply --layout-flex;
    }

    .project-selector-title {
      margin-left: 0;
    }

    .project-actions paper-button {
      color: var(--saved-request-editor-action-button-color, var(--primary-color));
      background-color: var(--saved-request-editor-action-button-background-color);
    }

    .project-actions .primary-action {
      @apply --action-button;
    }
    </style>
    <div class="header">
      <h2>Saved</h2>
      <div class="header-actions">
        <paper-menu-button dynamic-align="" id="mainMenu">
          <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
          <paper-listbox slot="dropdown-content" id="mainMenuOptions">
            <paper-icon-item class="menu-item" on-click="openExportAll">
              <iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>Export all
            </paper-icon-item>
            <paper-icon-item class="menu-item" on-click="_deleteAllClick">
              <iron-icon icon="arc:delete" slot="item-icon"></iron-icon>Delete all
            </paper-icon-item>
          </paper-listbox>
        </paper-menu-button>
      </div>
    </div>
    <template is="dom-if" if="[[querying]]">
      <paper-progress indeterminate=""></paper-progress>
    </template>
    <template is="dom-if" if="[[dataUnavailable]]">
      <p class="empty-info">The requests list is empty.</p>
      <p>
        Save a request using the
        <code class="command">[[_computeA11yCommand('s')]]</code> keys on the request editor screen.
      </p>
    </template>

    <section class="selection-options" hidden\$="[[listHidden]]">
      <p class="selection-label">Selected: [[selectedItems.length]]</p>
      <template is="dom-if" if="[[hasSelection]]">
        <paper-menu-button dynamic-align="" id="savedListMenu">
          <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
          <paper-listbox slot="dropdown-content" id="savedListMenuOptions">
            <paper-icon-item class="menu-item" on-click="_onExportSelected">
              <iron-icon icon="arc:export-variant" slot="item-icon"></iron-icon>Export selected
            </paper-icon-item>
            <paper-icon-item class="menu-item" data-action="delete-all" on-click="_deleteSelected">
              <iron-icon icon="arc:delete" slot="item-icon"></iron-icon>
              Delete selected
            </paper-icon-item>
            <paper-icon-item class="menu-item" data-action="project-selected" on-click="_projectSelected">
              <iron-icon icon="arc:collections-bookmark" slot="item-icon"></iron-icon>
              Add selected to a project
            </paper-icon-item>
          </paper-listbox>
        </paper-menu-button>
      </template>
      <div class="spacer"></div>
      <paper-input label="search" type="search" no-label-float=""></paper-input>
    </section>

    <saved-panel-list
      hidden\$="[[listHidden]]"
      requests="[[requests]]"
      list-type\$="[[listType]]"
      has-two-lines="[[_hasTwoLines]]"
      selected-items="{{selectedItems}}"
      draggable-enabled="[[draggableEnabled]]"
      on-list-items-threshold="loadNext"
      on-list-item-details="_onDetails"></saved-panel-list>

    <bottom-sheet id="requestDetailsContainer" on-iron-overlay-opened="_resizeSheetContent" opened="{{detailsOpened}}">
      <paper-fab
        icon="arc:keyboard-arrow-right"
        data-action="load-request-detail"
        title="Load request"
        on-click="_loadRequestDetails"></paper-fab>
      <saved-request-detail
        id="requestDetails"
        on-delete-request="_deleteRequestDetails"
        on-edit-request="_editRequestDetails"></saved-request-detail>
    </bottom-sheet>
    <bottom-sheet id="requestEditorContainer" on-iron-overlay-opened="_resizeSheetContent" opened="{{editorOpened}}">
      <saved-request-editor
        id="requestEditor"
        no-auto-projects="[[noAutoProjects]]"
        on-cancel-request-edit="_cancelRequestEdit"
        on-save-request="_saveRequestEdit"></saved-request-editor>
    </bottom-sheet>
    <bottom-sheet id="projectSelectorContainer">
      <h3 class="project-selector-title">Select project</h3>
      <paper-chip-input
        label="Select projects"
        value="{{selectedProjects}}"
        source="[[_computeProjectsAutocomplete(projects)]]"
        chip-remove-icon="arc:close"
        on-keydown="_projectAddKeydown"></paper-chip-input>
      <div class="project-actions">
        <paper-button
          data-action="cancel-add-project"
          on-click="cancelAddProject">Cancel</paper-button>
        <paper-button
          raised=""
          data-action="project-add"
          class="primary-action"
          on-click="_addSelectedProject">Add</paper-button>
      </div>
    </bottom-sheet>

    <bottom-sheet
      id="exportOptionsContainer"
      opened="{{_exportOptionsOpened}}"
      on-iron-overlay-opened="_resizeSheetContent">
      <export-options
        file="{{_exportOptions.file}}"
        provider="{{_exportOptions.provider}}"
        provider-options="{{_exportOptions.providerOptions}}"
        on-accept="_acceptExportOptions"
        on-cancel="_cancelExportOptions"></export-options>
    </bottom-sheet>

    <paper-toast id="noModel" class="error-toast" text="Model not found. Please, report an issue."></paper-toast>
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="revertError" class="error-toast"
      text="Unable to revert changes. Please, report an issue."></paper-toast>
    <paper-toast id="noExport" class="error-toast"
      text="Export module not found. Please, report an issue."></paper-toast>
    <paper-toast id="dataClearErrorToast" class="error-toast"
      text="Datasore delete error. Please report an issue"></paper-toast>
    <paper-toast id="requestProjectErrorToast" class="error-toast"
      text="Unable to update request detaile. See console for debug message."></paper-toast>
    <paper-toast id="driveSaved" text="Requests saved on Google Drive."></paper-toast>
    <paper-toast id="deleteToast" duration="7000">
      <paper-button class="revert-button" on-click="revertDeleted">Revert</paper-button>
    </paper-toast>
    <paper-dialog id="dataClearDialog" on-iron-overlay-closed="_onClearDialogResult">
      <h2>Danger zone</h2>
      <p>This will remove all data from the data store. Without option to restore it.</p>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <paper-button on-click="_exportAllFile">Create backup file</paper-button>
        <paper-button dialog-dismiss="" autofocus="">Cancel</paper-button>
        <paper-button dialog-confirm="" class="action-button">Destroy</paper-button>
      </div>
    </paper-dialog>
`;
  }

  static get is() {
    return 'saved-requests-panel';
  }

  static get properties() {
    return {
      /**
       * List of requests that has been recently removed
       */
      _latestDeleted: Array,
      /**
       * Computed value, true if the requests lists is hidden.
       */
      listHidden: {
        type: Boolean,
        value: true,
        computed: '_computeListHidden(hasRequests, isSearch)'
      },
      /**
       * Selected items list.
       * @type {Array<Object>}
       */
      selectedItems: Array,
      /**
       * Computed value, true when the user made a selection on the list.
       */
      hasSelection: {type: Boolean, computed: '_computeHasSelection(selectedItems.length)'},
      /**
       * When true the editor panel is rendered
       */
      editorOpened: Boolean,
      /**
       * When true the details panel is rendered
       */
      detailsOpened: Boolean,
      /**
       * List of selected in the dialog project names.
       * @type {Array<String>}
       */
      selectedProjects: Array,
      /**
       * Enables the comonent to accept drop action with a request.
       */
      draggableEnabled: {type: Boolean},
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: Boolean,
      _exportOptions: {
        type: Object,
        value: function() {
          return {
            file: this._generateFileName(),
            provider: 'file',
            providerOptions: {
              parents: ['My Drive']
            }
          };
        }
      }
    };
  }
  constructor() {
    super();
    this._navigateHandler = this._navigateHandler.bind(this);
    this._searchHandler = this._searchHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('navigate', this._navigateHandler);
    this.type = 'saved';
    const input = this.shadowRoot.querySelector('paper-input[type="search"]');
    input.inputElement.addEventListener('search', this._searchHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const input = this.shadowRoot.querySelector('paper-input[type="search"]');
    input.inputElement.removeEventListener('search', this._searchHandler);
    this.removeEventListener('navigate', this._navigateHandler);
  }
  /**
   * Notifies the list that the resize event occurred.
   * Should be called whhen content of the list changed but the list wasn't
   * visible at the time.
   */
  notifyResize() {
    const list = this.shadowRoot.querySelector('saved-panel-list');
    list.notifyResize();
  }
  /**
   * Computes value of the `listHidden` property.
   * List is hidden when no requests are found and it is not searching.
   * @param {Boolean} hasRequests
   * @param {Boolean} isSearch
   * @return {Boolean}
   */
  _computeListHidden(hasRequests, isSearch) {
    if (isSearch) {
      return false;
    }
    return !hasRequests;
  }
  /**
   * Handler for navigate action from the list
   */
  _navigateHandler() {
    if (this.detailsOpened) {
      this.detailsOpened = false;
    }
  }
  /**
   * Opens the request details applet with the request.
   * @param {CustomEvent} e
   */
  _onDetails(e) {
    this.$.requestDetails.request = e.detail.request;
    this.detailsOpened = true;
  }
  /**
   * Fires `navigate` event for currently loaded in the details request.
   */
  _loadRequestDetails() {
    this._openRequest(this.$.requestDetails.request._id);
    this.detailsOpened = false;
  }
  /**
   * Handler for search event from search input.
   * @param {Event} e
   */
  _searchHandler(e) {
    const {value} = e.target;
    this.query(value);
  }
  /**
   * Handles items delete event from item click.
   * @return {Promise}
   */
  _deleteSelected() {
    this._closeSelectionMenu();
    const data = this.selectedItems;
    if (!data.length) {
      return;
    }
    return this._delete(data);
  }
  /**
   * Deletes a request from the details panel.
   * @return {Promise}
   */
  _deleteRequestDetails() {
    const data = [this.$.requestDetails.request];
    this.detailsOpened = false;
    return this._delete(data);
  }
  /**
   * Performs a delete action of request items.
   *
   * @param {Array<Object>} deleted List of deleted items.
   * @return {Promise}
   */
  _delete(deleted) {
    const e = this._dispatchDelete(deleted);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Model not found'));
    }
    return e.detail.result
    .then((updated) => {
      return Object.keys(updated)
      .map((id) => {
        return {
          _id: id,
          _rev: updated[id]
        };
      });
    })
    .then((deleted) => {
      this._latestDeleted = deleted;
      let msg;
      if (deleted.length === 1) {
        msg = 'The request has been removed.';
      } else {
        msg = deleted.length + ' requests has been removed.';
      }
      this.$.deleteToast.text = msg;
      this.$.deleteToast.opened = true;
    });
  }
  /**
   * Dispatches `request-objects-deleted` event.
   * @param {Array<Object>} deleted List of requests to delete.
   * @return {CustomEvent}
   */
  _dispatchDelete(deleted) {
    const e = new CustomEvent('request-objects-deleted', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        type: this.type,
        items: deleted.map((item) => item._id)
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Restores removed requests.
   * It does nothing if `_latestDeleted` is not set or empty.
   *
   * @return {Promise} A promise resolved when objects were restored
   */
  revertDeleted() {
    this.$.deleteToast.opened = false;
    const deleted = this._latestDeleted;
    if (!deleted || !deleted.length) {
      return Promise.resolve();
    }
    const e = this._dispatchUndelete(deleted);
    if (!e.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Model not found'));
    }
    return e.detail.result
    .catch((cause) => {
      this.$.revertError.opened = true;
      this._handleError(cause);
    });
  }
  /**
   * Dispatches `request-objects-undeleted` event.
   * @param {Array<Object>} items List of deleted requests. The list
   * contains objects with `_id` and `_rev` properties.
   * @return {CustomEvent}
   */
  _dispatchUndelete(items) {
    const e = new CustomEvent('request-objects-undeleted', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        type: this.type,
        items
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Forces selection menu to close.
   */
  _closeSelectionMenu() {
    const menu = this.shadowRoot.querySelector('#savedListMenu');
    if (!menu) {
      console.warn('Menu not found in the DOM');
      return;
    }
    menu.opened = false;
    this.shadowRoot.querySelector('#savedListMenuOptions').selected = -1;
  }
  /**
   * Forces main menu to close.
   */
  _closeMainMenu() {
    this.$.mainMenu.opened = false;
    this.$.mainMenuOptions.selected = -1;
  }
  /**
   * Toggles export options panel and sets export items to all currently loaded requests.
   */
  openExportAll() {
    this._closeMainMenu();
    this._exportOptionsOpened = !this._exportOptionsOpened;
    this._exportItems = true;
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }

  /**
   * Creates export file for all items.
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        kind: 'ARC#SavedExport',
        provider: 'file'
      }
    };
    return this._doExportItems(true, detail);
  }

  _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const detail = e.detail;
    return this._doExportItems(this._exportItems, detail);
  }

  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {Array} requests List of request to export with the project.
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  _doExportItems(requests, detail) {
    detail.options.kind = 'ARC#SavedExport';
    const request = this._dispatchExportData(requests, detail);
    return request.detail.result
    .then(() => {
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.$.driveSaved.opened = true;
      }
      this._exportItems = undefined;
    })
    .catch((cause) => {
      this.$.errorToast.text = cause.message;
      this.$.errorToast.opened = true;
      console.warn(cause);
    });
  }

  _onExportSelected() {
    this._closeSelectionMenu();
    this._exportOptionsOpened = true;
    this._exportItems = this.selectedItems || [];
  }
  /**
   * Handler for delete all menu option click.
   */
  _deleteAllClick() {
    this._closeMainMenu();
    this.$.dataClearDialog.opened = true;
  }
  /**
   * Called when delete datastore dialog is closed.
   * @param {CustomEvent} e
   */
  _onClearDialogResult(e) {
    if (!e.detail.confirmed) {
      return;
    }
    this._clearDatastore();
  }
  /**
   * Removes all data from the datastore and then fires
   */
  _clearDatastore() {
    const e = this._dispatchDeleteModel();
    if (!e.detail.result) {
      this.$.dataClearErrorToast.opened = true;
      this._handleError(new Error('Model not found.'));
      return;
    }
    Promise.all(e.detail.result)
    .catch((cause) => {
      this.$.dataClearErrorToast.opened = true;
      this._handleError(cause);
    });
  }
  /**
   * Dispatches `destroy-model` with `saved` on the models list.
   * @return {CustomEvent}
   */
  _dispatchDeleteModel() {
    const e = new CustomEvent('destroy-model', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        models: ['saved']
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Opens request details editor in place of the request details applet.
   */
  _editRequestDetails() {
    const request = Object.assign({}, this.$.requestDetails.request);
    this.$.requestEditor.request = request;
    this.$.requestDetails.request = undefined;
    this.detailsOpened = false;
    this.editorOpened = true;
  }

  _resizeSheetContent(e) {
    const panel = e.target.querySelector(
        'saved-request-editor,saved-request-detail');
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
  }

  _cancelRequestEdit() {
    this.editorOpened = false;
  }
  /**
   * Handler to save the request event from the editor.
   */
  _saveRequestEdit() {
    this.editorOpened = false;
    this.$.requestEditor.request = undefined;
  }

  _computeHasSelection(length) {
    return !!length;
  }
  /**
   * Computes a proper key command depending on the platform.
   *
   * @param {String} key The key modifier for the command
   * @return {String} Keyboard command for the key.
   */
  _computeA11yCommand(key) {
    const isMac = navigator.platform.indexOf('Mac') !== -1;
    let cmd = '';
    if (isMac) {
      cmd += 'meta+';
    } else {
      cmd += 'ctrl+';
    }
    cmd += key;
    return cmd;
  }
  /**
   * Handles menu click for adding selected requests to a project.
   */
  _projectSelected() {
    this._closeSelectionMenu();
    const requests = this.selectedItems;
    if (!requests || !requests.length) {
      return;
    }
    this.$.projectSelectorContainer.opened = true;
  }
  /**
   * Cancels adding to project dialog.
   */
  cancelAddProject() {
    this.$.projectSelectorContainer.opened = false;
  }
  /**
   * Updates requests objects with projects ids.
   * @param {Array<Object>} requests List of requests to update
   * @param {Array<String>} ids List of project IDs.
   * @return {Array<Object>}
   */
  _updateRequestsProjects(requests, ids) {
    requests.forEach((item) => {
      if (!item.projects) {
        item.projects = [];
      }
      if (item.legacyProject) {
        if (item.projects.indexOf(item.legacyProject) === -1) {
          item.projects[item.projects.length] = item.legacyProject;
        }
        delete item.legacyProject;
      }
      item.projects = item.projects.concat(ids);
    });
    return requests;
  }
  /**
   * Adds selected requests to a project.
   * @return {Promise}
   */
  _addSelectedProject() {
    const requests = this.selectedItems;
    if (!requests || !requests.length) {
      throw new Error('Something is wrong. There\'s no selection. You shouldn\'t see this.');
    }
    this.$.projectSelectorContainer.opened = false;
    const info = this._processSelectedProjectsInfo(this.selectedProjects);
    let p;
    if (info.add.length) {
      p = this._createProjects(info.add, requests.map((i) => i._id));
    } else {
      p = Promise.resolve();
    }
    return p
    .then((created) => this._prepareProjectsIdsList(created, info.existing))
    .then((projectIds) => this._updateRequestsProjects(requests, projectIds))
    .then((requests) => {
      const e = new CustomEvent('request-objects-changed', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          type: 'saved',
          requests
        }
      });
      this.dispatchEvent(e);
      if (!e.defaultPrevented) {
        this.$.noModel.opened = true;
        return Promise.reject(new Error('Model not found'));
      }
      return e.detail.result;
    })
    .catch((cause) => {
      this.$.requestProjectErrorToast.opened = true;
      throw cause;
    });
  }
  /**
   * Dispatches `project-update-bulk` custom event and returns event's
   * promise.
   * @param {Array<String>} names List of names.
   * @param {Array<String>} requestIds List of request IDs to associate with the project.
   * @return {Promise<Array<Object>>}
   */
  _createProjects(names, requestIds) {
    const projects = names.map((name) => {
      return {
        name,
        requests: requestIds
      };
    });
    const e = new CustomEvent('project-update-bulk', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        projects
      }
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      return Promise.reject(new Error('The project-model is not in the DOM.'));
    }
    return e.detail.result;
  }

  _prepareProjectsIdsList(created, ids) {
    ids = ids || [];
    if (!created || !created.length) {
      return ids;
    }
    const createdIds = created.map((item) => item._id);
    return ids.concat(createdIds);
  }

  /**
   * Updates icon size CSS variable and notifies resize on the list when
   * list type changes.
   * @param {?String} type
   */
  _updateListStyles(type) {
    let size;
    switch (type) {
      case 'comfortable': size = 40; break;
      case 'compact': size = 36; break;
      default: size = 56; break;
    }
    const list = this.shadowRoot.querySelector('saved-panel-list');
    this._applyListStyles(size, list);
  }

  _generateFileName() {
    return 'arc-saved-export.json';
  }
  /**
   * Listens for Enter + cmd/ctrl button to accept project selection.
   * @param {KeyboardEvent} e
   */
  _projectAddKeydown(e) {
    if (e.key !== 'Enter') {
      return;
    }
    if (!e.metaKey && !e.ctrlKey) {
      return;
    }
    this._addSelectedProject();
  }
}
window.customElements.define(SavedRequestsPanel.is, SavedRequestsPanel);
