import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../saved-panel-list.js';

describe('<saved-panel-list>', function() {
  async function draggableFixture(requests) {
    return await fixture(html`<saved-panel-list
      draggableenabled
      .requests="${requests}"></saved-panel-list>`);
  }

  // DataTransfer polyfill
  if (typeof DataTransfer === 'undefined') {
    class DataTransfer {
      setData(type, data) {
        this._data[type] = data;
      }
      getData(type) {
        if (!this._data) {
          return null;
        }
        return this._data[type];
      }
    }
    window.DataTransfer = DataTransfer;
  }

  describe('_dragStart()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 30
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    function dispatch(element) {
      const node = element.shadowRoot.querySelector('anypoint-icon-item');
      const e = new Event('dragstart');
      e.dataTransfer = new DataTransfer();
      node.dispatchEvent(e);
      return e;
    }

    it('sets arc/request-object transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/request-object');
      assert.typeOf(data, 'string');
    });

    it('Sets arc/saved-request data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc/saved-request');
      assert.equal(data, element.requests[0]._id);
    });

    it('Sets arc-source/saved-panel transfer data', () => {
      const e = dispatch(element);
      const data = e.dataTransfer.getData('arc-source/saved-panel');
      assert.equal(data, element.requests[0]._id);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });

    it('Ignores event when draggableEnabled not set', () => {
      element.draggableEnabled = false;
      const e = dispatch(element);
      assert.isUndefined(e.dropEffect);
    });
  });

  describe('_dragoverHandler()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture(requests);
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragover', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragoverHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Sets drop-target class on the element', () => {
      dispatch(element);
      assert.isTrue(element.classList.contains('drop-target'));
    });

    it('Sets class name only once', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isTrue(element.classList.contains('drop-target'));
    });
  });

  describe('_dragleaveHandler()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture(requests);
    });

    function dispatch(element, types) {
      if (!types) {
        types = ['arc/request-object'];
      }
      const e = new Event('dragleave', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, 'test');
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dragleaveHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });
  });

  describe('_dropHandler()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture(requests);
    });

    function dispatch(element, types, content) {
      if (!types) {
        types = ['arc/request-object'];
      }
      if (content === undefined) {
        content = '{"_id":"test-id", "_rev":"test-rev"}';
      }
      const e = new Event('drop', { cancelable: true });
      e.dataTransfer = new DataTransfer();
      types.forEach((type) => {
        e.dataTransfer.setData(type, content);
      });
      element.dispatchEvent(e);
      return e;
    }

    it('Ignores event when draggableEnabled is not set', () => {
      element.draggableEnabled = false;
      element._dropHandler();
      // no error
    });

    it('Ignores event when arc/request-object is not set', () => {
      dispatch(element, ['other']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Ignores event when arc/saved-request is set', () => {
      dispatch(element, ['arc/saved-request']);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Cancels the event', () => {
      const e = dispatch(element);
      assert.isTrue(e.defaultPrevented);
    });

    it('Removes drop-target class on the element', () => {
      element.classList.add('drop-target');
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Removes class name only once', () => {
      dispatch(element);
      assert.isFalse(element.classList.contains('drop-target'));
    });

    it('Calls _appendRequest() with request', () => {
      element._appendRequest = () => {};
      const spy = sinon.spy(element, '_appendRequest');
      dispatch(element);
      assert.deepEqual(spy.args[0][0], {
        _id: 'test-id',
        _rev: 'test-rev'
      });
    });

    it('Ignores when no request object data', () => {
      const spy = sinon.spy(element, '_appendRequest');
      dispatch(element, null, '');
      assert.isFalse(spy.called);
    });
  });

  describe('_appendRequest()', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async function() {
      element = await draggableFixture(requests);
    });

    it('removes `_id`', () => {
      const obj = { _id: 'test' };
      const spy = sinon.spy();
      element.addEventListener('save-request', spy);
      element._appendRequest(obj);
      assert.notEqual(spy.args[0][0].detail.request._id, 'test');
    });

    it('Removes `_rev`', () => {
      const obj = { _rev: 'test' };
      element._appendRequest(obj);
      assert.isUndefined(obj._rev);
    });

    it('Removes history list item data', () => {
      const obj = {
        timeLabel: 'a',
        dayTime: 1234,
        hasHeader: true,
        header: 'abc'
      };
      element._appendRequest(obj);
      assert.isUndefined(obj.timeLabel);
      assert.isUndefined(obj.dayTime);
      assert.isUndefined(obj.hasHeader);
      assert.isUndefined(obj.header);
    });

    it('Adds default name', () => {
      const obj = {};
      element._appendRequest(obj);
      assert.equal(obj.name, 'Unnamed');
    });

    it('Keeps existing name', () => {
      const obj = { name: 'test' };
      element._appendRequest(obj);
      assert.equal(obj.name, 'test');
    });

    it('dispatches save-request event', () => {
      const spy = sinon.spy();
      element.addEventListener('save-request', spy);
      const obj = { name: 'test' };
      element._appendRequest(obj);
      assert.equal(spy.args[0][0].type, 'save-request');
      assert.deepEqual(spy.args[0][0].detail.request, obj);
    });
  });

  describe('a11y', () => {
    let requests;
    before(async () => {
      requests = DataGenerator.generateRequests({
        requestsSize: 3
      });
    });

    let element;
    beforeEach(async () => {
      element = await draggableFixture(requests);
    });

    it('is accessible with list items', async () => {
      await assert.isAccessible(element);
    });

    it('is accessible with selected items', async () => {
      const items = element._list.items;
      MockInteractions.tap(items[0]);
      MockInteractions.tap(items[2]);
      await nextFrame();
      await assert.isAccessible(element);
    });
  });
});
