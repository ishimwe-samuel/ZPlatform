// test/api.test.js

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Import your Express app

const expect = chai.expect;

chai.use(chaiHttp);

describe('API Tests', () => {
  it('should return "Hello, World!" from GET /api', (done) => {
    chai
      .request(app)
      .get('/api')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Hello, World!');
        done();
      });
  });

  // Add more test cases as needed
});
