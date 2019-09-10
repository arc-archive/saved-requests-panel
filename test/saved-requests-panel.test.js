import { fixture, assert, aTimeout, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../saved-requests-panel.js';

describe('<saved-requests-panel>', function() {
  async function basicFixture() {
    return await fixture(
      html`
        <saved-requests-panel noauto noautoprojects></saved-requests-panel>
      `
    );
  }

  describe('selection options', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateRequests({
        requestsSize: 2
      });
      element.selectedItems = element.requests;
      await nextFrame();
    });

    it('has default selection options', () => {
      const exp = element.shadowRoot.querySelector('[data-action=export-selected]');
      assert.ok(exp, 'has export menu item');
      const del = element.shadowRoot.querySelector('[data-action=delete-selected]');
      assert.ok(del, 'has delete menu item');
    });

    it('has project menu item', () => {
      const node = element.shadowRoot.querySelector('[data-action=project-selected]');
      assert.ok(node);
    });
  });

  describe('_computeA11yCommand()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns passed letter with CMD/CTRL', () => {
      const result = element._computeA11yCommand('s');
      assert.isTrue(/(meta|ctrl)\+s/.test(result));
    });
  });

  describe('_editRequestDetails()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.requests = DataGenerator.generateRequests({
        requestsSize: 2
      });
      element._requestDetails.opened = true;
      element._requestDetails.request = element.requests[0];
      await aTimeout();
    });

    it('sets request on the editor', () => {
      element._editRequestDetails();
      assert.typeOf(element._requestEditor.request, 'object');
    });

    it('the request object has saved type', () => {
      element._editRequestDetails();
      assert.equal(element._requestEditor.request.type, 'saved');
    });

    it('clears detail request', () => {
      element._editRequestDetails();
      assert.isUndefined(element._requestDetails.request);
    });

    it('closes details panel', () => {
      element._editRequestDetails();
      assert.isFalse(element.detailsOpened);
    });

    it('opens editor panel', () => {
      element._editRequestDetails();
      assert.isTrue(element.editorOpened);
    });
  });

  describe('_projectSelected()', () => {
    let element;
    let list;
    beforeEach(async () => {
      element = await basicFixture();
      list = DataGenerator.generateRequests({
        requestsSize: 2
      });
      element.requests = list;
      element.selectedItems = list;
      await nextFrame();
      const node = element.shadowRoot.querySelector('#projectSelectorContainer');
      node.opened = false;
    });

    it('Closes selection menu', () => {
      const spy = sinon.spy(element, '_deselectSelectionMenu');
      element._projectSelected();
      assert.isTrue(spy.called);
    });

    it('Does nothing when no selection', () => {
      element.selectedItems = undefined;
      element._projectSelected();
      const node = element.shadowRoot.querySelector('#projectSelectorContainer');
      assert.isFalse(node.opened);
    });

    it('Opens project selector', () => {
      element._projectSelected();
      const node = element.shadowRoot.querySelector('#projectSelectorContainer');
      assert.isTrue(node.opened);
    });
  });

  describe('cancelAddProject()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const node = element.shadowRoot.querySelector('#projectSelectorContainer');
      node.opened = true;
    });

    it('Closes project selector', () => {
      element.cancelAddProject();
      const node = element.shadowRoot.querySelector('#projectSelectorContainer');
      assert.isFalse(node.opened);
    });
  });

  describe('_prepareProjectsIdsList()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty array when no arguments', () => {
      const result = element._prepareProjectsIdsList();
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 0);
    });

    it('Returns passed "ids" when no "created"', () => {
      const result = element._prepareProjectsIdsList([], ['test']);
      assert.deepEqual(result, ['test']);
    });

    it('Adds ids from created', () => {
      const result = element._prepareProjectsIdsList([{ _id: 'created' }], ['test']);
      assert.deepEqual(result, ['test', 'created']);
    });
  });

  describe('_updateRequestsProjects()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Creates "projects" property', () => {
      const result = element._updateRequestsProjects([{}], ['test']);
      assert.typeOf(result[0].projects, 'array');
      assert.deepEqual(result[0].projects, ['test']);
    });

    it('Adds "legacyProject" to "projects"', () => {
      const result = element._updateRequestsProjects(
        [
          {
            legacyProject: 'legacy'
          }
        ],
        ['test']
      );
      assert.typeOf(result[0].projects, 'array');
      assert.deepEqual(result[0].projects, ['legacy', 'test']);
    });

    it('Removes "legacyProject" from the request', () => {
      const result = element._updateRequestsProjects(
        [
          {
            legacyProject: 'legacy'
          }
        ],
        ['test']
      );
      assert.isUndefined(result[0].legacyProject);
    });

    it('Ignores "legacyProject" if already on "projects" list', () => {
      const result = element._updateRequestsProjects(
        [
          {
            legacyProject: 'legacy',
            projects: ['legacy']
          }
        ],
        ['test']
      );
      assert.deepEqual(result[0].projects, ['legacy', 'test']);
    });
  });

  describe('_createProjects()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    afterEach(async () => {
      await DataGenerator.clearLegacyProjects();
    });

    it('creates projects in bulk operation', async () => {
      await element._createProjects(['name-x'], ['request-x']);
      const projects = await DataGenerator.getDatastoreProjectsData();
      assert.lengthOf(projects, 1);
    });

    it('created project has own proeprties', async () => {
      await element._createProjects(['name-x'], ['request-x']);
      const projects = await DataGenerator.getDatastoreProjectsData();
      const item = projects[0];
      assert.equal(item.name, 'name-x');
      assert.deepEqual(item.requests, ['request-x']);
    });
  });

  describe('_addSelectedProject()', () => {
    let projectId;
    let requests;
    before(async () => {
      const createdRequests = await DataGenerator.insertSavedRequestData({
        requestsSize: 2
      });
      requests = createdRequests.requests;
      const projects = await DataGenerator.insertProjectsData({
        projectsSize: 1
      });
      projectId = projects[0]._id;
    });

    after(async () => {
      await DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await element._loadPage();
      await element._updateProjectsList();
      await nextFrame();
    });

    it('throws when no selection', async () => {
      let called = false;
      try {
        await element._addSelectedProject();
      } catch (e) {
        called = true;
      }
      assert.isTrue(called);
    });

    it('adds existing project to a request', async () => {
      const id = requests[0]._id;
      element.selectedProjects = [projectId];
      element.selectedItems = [requests[0]];
      await element._addSelectedProject();
      const updated = await DataGenerator.getDatastoreRequestData();
      const item = updated.find((item) => item._id === id);
      // data generator may add project to the request
      assert.notEqual(item.projects.indexOf(projectId), -1);
    });

    it('adds new project to a request', async () => {
      const id = requests[1]._id;
      element.selectedProjects = ['new-project'];
      element.selectedItems = [requests[1]];
      await element._addSelectedProject();
      const projects = await DataGenerator.getDatastoreProjectsData();
      const project = projects.find((item) => item.name === 'new-project');
      const updated = await DataGenerator.getDatastoreRequestData();
      const item = updated.find((item) => item._id === id);
      // data generator may add project to the request
      assert.notEqual(item.projects.indexOf(project._id), -1);
    });
  });

  describe('_projectAddKeydown()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._addSelectedProject = () => {};
    });

    it('Ignores key when not Enter key', () => {
      const spy = sinon.spy(element, '_addSelectedProject');
      element._projectAddKeydown({ key: 'a' });
      assert.isFalse(spy.called);
    });

    it('Ignores key when no ctrl/cmd', () => {
      const spy = sinon.spy(element, '_addSelectedProject');
      element._projectAddKeydown({ key: 'Enter', ctrlKey: false, metaKey: false });
      assert.isFalse(spy.called);
    });

    it('Calls _addSelectedProject() when ctrl', () => {
      const spy = sinon.spy(element, '_addSelectedProject');
      element._projectAddKeydown({ key: 'Enter', ctrlKey: true, metaKey: false });
      assert.isTrue(spy.called);
    });

    it('Calls _addSelectedProject() when meta', () => {
      const spy = sinon.spy(element, '_addSelectedProject');
      element._projectAddKeydown({ key: 'Enter', ctrlKey: false, metaKey: true });
      assert.isTrue(spy.called);
    });
  });

  describe('_generateFileName()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Generates file name', () => {
      const result = element._generateFileName();
      assert.match(result, /^arc-saved-export-[0-9]{4}-[0-9]{2}-[0-9]{2}.arc$/);
    });
  });
});
