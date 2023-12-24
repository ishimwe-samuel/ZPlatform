// test/api.test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import your Express app

const expect = chai.expect;

chai.use(chaiHttp);

describe('API Tests', () => {
  it('should return "Welcome to ZPlatform!" from GET /api', (done) => {
    chai
      .request(app)
      .get('/api')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Welcome to ZPlatform!');
        done();
      });
  });

  // Add more test cases as needed
});
