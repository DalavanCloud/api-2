const assert = require('assert');

const utils = require('../../utils/utils');

describe('utils', () => {
  describe('#getUnchangedDocs', () => {
    it('Return with an empty array if docs changed', () => {
      const docs = [{ name: 'helloWorld' }];
      const unchanged = utils.getUnchangedDocs(docs);
      assert.deepEqual(unchanged, []);
    });

    it('Should return with action name if unchanged', () => {
      const defaultDocs = [{
        name: 'helloWorld',
        description: 'Edit the description of your service here',
        fullDescription: 'THESE COMMENTS ARE YOUR DOCUMENTATION! You can view the full docs for our documentation format at: https://docs.readme.build/docs/writing-documentation Write a description and define your API in this code block.',
        returns: { description: 'A very friendly greeting', type: 'string' },
      }];
      const unchanged = utils.getUnchangedDocs(defaultDocs);
      assert.deepEqual(unchanged, ['helloWorld']);
    });
  });

  describe('#parseResponse', () => {
    it('should parse a string response', () => {
      const response = { body: 'test' };
      assert.equal(response.body, utils.parseResponse(response));
    });

    it('should parse number response', () => {
      const response = { body: 1 };
      assert.equal(response.body, utils.parseResponse(response));
    });

    it('should parse object response', () => {
      const body = { test: 1 };
      const response = { body: JSON.stringify(body) };
      assert.deepEqual(body, utils.parseResponse(response));
    });

    it('should parse buffer response', () => {
      const body = new Buffer('test');
      const response = { body: JSON.stringify(body) };
      assert.deepEqual(body, utils.parseResponse(response));
    });

    it('should parse nested response', () => {
      const body = {
        test: 1,
        file: {
          image: new Buffer('test'),
        },
      };
      const response = { body: JSON.stringify(body) };
      assert.deepEqual(body, utils.parseResponse(response));
    });
  });

  describe('#parseData', () => {
    it('should parse data with primitives', () => {
      const data = { x: 1, y: 2, test: 'test' };
      assert.deepEqual({ data: JSON.stringify(data) }, utils.parseData(data));
    });

    it('should parse data with just a buffer', () => {
      const data = { file: new Buffer('test') };
      assert.deepEqual(Object.assign({ data: '{}' }, data), utils.parseData(data));
    });


    it('should parse data with a buffer and other data', () => {
      const data = { file: new Buffer('test'), width: 100, height: 200 };
      const dataString = JSON.stringify({ width: 100, height: 200 });
      const expected = Object.assign({ data: dataString }, { file: data.file });
      assert.deepEqual(expected, utils.parseData(data));
    });
  });

  describe('#isUrl', () => {
    it('should return true if valid url', () => {
      assert(utils.isUrl('https://google.com'));
    });

    it('should return false if not valid url', () => {
      assert.equal(false, utils.isUrl('/path/to/image'));
    });
  });
});
