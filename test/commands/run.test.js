const assert = require('assert');
const nock = require('nock');
const path = require('path');

const { BUILD_URL } = require('../../dist/utils/utils');
const { run } = require('../../dist/commands/run');

describe('run command', () => {
  it('should throw if no service provided', () => {
    assert.throws(() => {
      run(['run']);
    }, 'Missing service');
  });

  it('should throw if no action provided', () => {
    assert.throws(() => {
      run(['run', 'service']);
    }, 'Missing action');
  });

  const key = '123456';
  const action = 'action';

  it('should default team to personal team', () => {
    const service = 'service';
    const teamsMock = nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [
        { key, personal: true },
        { key: '456789', personal: false },
      ],
    }));

    const invokeMock = nock(BUILD_URL)
      .post(`/run/${service}/${action}`)
      .basicAuth({ user: key })
      .reply(() => {
        return [200, {}, {}];
      });

    return run(['run', service, action], {}).then(() => {
      teamsMock.done();
      invokeMock.done();
    });
  });

  it('should report invalid team', () => {
    const service = 'service';
    nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [
        { key, personal: true, name: 'team1' },
        { key: '456789', personal: false, name: 'team2' },
      ],
    }));

    return run(['run', service, action], { team: 'team3' }).catch((err) => {
      assert.equal(err.message, 'Cannot find team team3');
    });
  });

  it('should prefix service name with @ if it contains a slash', () => {
    const service = 'team/service-1';
    nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [{ key, personal: true }],
    }));

    const invokeMock = nock(BUILD_URL)
      .post(`/run/@${service}/${action}`)
      .basicAuth({ user: key })
      .reply(() => {
        return [200, {}, {}];
      });

    return run(['run', service, action], {}).then(() => {
      return invokeMock.done();
    });
  });

  it('should pass file if @path is used', () => {
    const service = 'service-1';
    nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [{ key, personal: true }],
    }));
    const invokeMock = nock(BUILD_URL)
      .post(`/run/${service}/${action}`, (passedBody) => {
        const test1 = passedBody.includes('form-data; name="file"; filename="test.jpg"');
        const test2 = passedBody.includes('Content-Type: image/jpeg');
        return test1 && test2;
      })
      .basicAuth({ user: key })
      .reply(() => {
        return [200, {}, {}];
      });

    return run(['run', service, action, `file=@${path.join(__dirname, '../fixtures/test.jpg')}`], {}).then(() => {
      return invokeMock.done();
    });
  });
});

