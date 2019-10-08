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
import { HistoryPanel } from '@advanced-rest-client/history-panel/src/HistoryPanel.js';
import '@advanced-rest-client/history-panel/history-panel-list.js';
import { ProjectsListConsumerMixin } from
  '@advanced-rest-client/projects-list-consumer-mixin/projects-list-consumer-mixin.js';
import { SavedListMixin } from '@advanced-rest-client/saved-list-mixin/saved-list-mixin.js';
import { cache } from 'lit-html/directives/cache.js';
import '@anypoint-web-components/anypoint-chip-input/anypoint-chip-input.js';
import { collectionsBookmark } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '../saved-panel-list.js';
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
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin RequestsListMixin
 * @appliesMixin ProjectsListConsumerMixin
 * @appliesMixin SavedListMixin
 */
export class SavedRequestsPanel extends SavedListMixin(ProjectsListConsumerMixin(HistoryPanel)) {
  static get styles() {
    return [
      HistoryPanel.styles,
      css`
      saved-panel-list {
        overflow: auto;
        flex: 1;
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
      }

      .project-actions {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .selection-options {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 56px;
      }

      .spacer {
        flex: 1;
      }

      .project-selector-title {
        margin-left: 0;
      }

      .icon {
        width: 24px;
        height: 24px;
        display: inline-block;
        fill: currentColor;
      }
      `
    ];
  }

  _unavailableTemplate() {
    const { dataUnavailable } = this;
    if (!dataUnavailable) {
      return '';
    }
    const cmd = this._computeA11yCommand('s');
    return html`<p class="empty-info">The requests list is empty.</p>
    <p>
      Save a request using the
      <code class="command">${cmd}</code> keys on the request editor screen.
    </p>`;
  }

  _selectionOptionsTemplate() {
    return html`${super._selectionOptionsTemplate()}
    <anypoint-icon-item
      class="menu-item"
      data-action="project-selected"
      @click="${this._projectSelected}"
    >
      <span class="icon" slot="item-icon">${collectionsBookmark}</span>
      Add selected to a project
    </anypoint-icon-item>`;
  }

  _listTemplate() {
    const {
      listHidden,
      compatibility,
      requests,
      draggableEnabled,
      listType,
      _hasTwoLines
    } = this;
    return cache(listHidden ? '' : html`<saved-panel-list
      ?compatibility="${compatibility}"
      .requests="${requests}"
      .draggableEnabled="${draggableEnabled}"
      listtype="${listType}"
      ?hastwolines="${_hasTwoLines}"
      @list-items-threshold="${this.loadNext}"
      @list-item-details="${this._onDetails}"
      @selecteditems-changed="${this._selectionHandler}"></saved-panel-list>`);
  }

  _projectSelectorTemplate() {
    const {
      compatibility,
      projects,
      selectedProjects
    } = this;
    const source = this._computeProjectsAutocomplete(projects);
    return html`
    <bottom-sheet
      id="projectSelectorContainer">
      <h3 class="project-selector-title">Select project</h3>
      <anypoint-chip-input
        .source="${source}"
        ?compatibility="${compatibility}"
        .chipsValue="${selectedProjects}"
        @keydown="${this._projectAddKeydown}"
        @chips-changed="${this._projectsHandler}">
        <label slot="label">Select projects</label>
      </anypoint-chip-input>
      <div class="project-actions">
        <anypoint-button
          data-action="cancel-add-project"
          ?compatibility="${compatibility}"
          @click="${this.cancelAddProject}">Cancel</anypoint-button>
        <anypoint-button
          emphasis="high"
          data-action="project-add"
          class="primary-action"
          ?compatibility="${compatibility}"
          @click="${this._addSelectedProject}">Add</anypoint-button>
      </div>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`
    ${super._toastsTemplate()}
    <paper-toast id="requestProjectErrorToast" class="error-toast"
      text="Unable to update request detaile. See console for debug message."></paper-toast>
    `;
  }

  render() {
    return html`
    ${super.render()}
    ${this._projectSelectorTemplate()}
    `;
  }

  get _list() {
    return this.shadowRoot.querySelector('saved-panel-list');
  }

  get _projectSelectorContainer() {
    return this.shadowRoot.querySelector('#projectSelectorContainer');
  }

  static get properties() {
    return {
      /**
       * List of selected in the dialog project names.
       * @type {Array<String>}
       */
      selectedProjects: { type: Array }
    };
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.type = 'saved';
    this._exportKind = 'ARC#SavedExport';
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
   * Opens request details editor in place of the request details applet.
   */
  _editRequestDetails() {
    const request = Object.assign({}, this._requestDetails.request);
    this._requestEditor.request = request;
    this._requestDetails.request = undefined;
    this.detailsOpened = false;
    this.editorOpened = true;
  }
  /**
   * Handles menu click for adding selected requests to a project.
   */
  _projectSelected() {
    const requests = this.selectedItems;
    if (!requests || !requests.length) {
      return;
    }
    this._deselectSelectionMenu();
    this._projectSelectorContainer.opened = true;
  }
  /**
   * Cancels adding to project dialog.
   */
  cancelAddProject() {
    this._projectSelectorContainer.opened = false;
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
  async _addSelectedProject() {
    const requests = this.selectedItems;
    if (!requests || !requests.length) {
      throw new Error('Something is wrong. There\'s no selection. You shouldn\'t see this.');
    }
    this._projectSelectorContainer.opened = false;

    const info = this._processSelectedProjectsInfo(this.selectedProjects);
    let created;
    if (info.add.length) {
      created = await this._createProjects(info.add, requests.map((i) => i._id));
    }
    try {
      const projectIds = this._prepareProjectsIdsList(created, info.existing);
      const updateRequests = this._updateRequestsProjects(requests, projectIds);
      const model = this.requestModel;
      return await model.updateBulk(this.type, updateRequests);
    } catch (e) {
      const toast = this.shadowRoot.querySelector('#requestProjectErrorToast');
      toast.opened = true;
      throw e;
    }
  }
  /**
   * Dispatches `project-update-bulk` custom event and returns event's
   * promise.
   * @param {Array<String>} names List of names.
   * @param {Array<String>} requestIds List of request IDs to associate with the project.
   * @return {Promise<Array<Object>>}
   */
  async _createProjects(names, requestIds) {
    const projects = names.map((name) => {
      return {
        name,
        requests: requestIds
      };
    });
    const model = this.projectsModel;
    return await model.updateBulk(projects);
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
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    const d = new Date();
    const year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    return `arc-saved-export-${year}-${month}-${day}.arc`;
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

  _projectsHandler(e) {
    this.selectedProjects = e.detail.value;
  }
}
