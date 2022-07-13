process.env.NODE_ENV = 'test';

let chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect  = require("chai").expect;

let app;

chai.use(chaiHttp);

describe('ALL APIs Testing', () => {

  const client_id_random = 'random';
  const client_secret_random = 233453434;
  const access_token_body = {grant_type:"client_credentials",client_id:"test",client_secret:1234};
  let _correctToken = null;
  let bearerToken = null;

  const bearer_expored_token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJ0ZXN0IiwiZXhwaXJlc19pbiI6MTY1NzUzMTk2OCwiaWF0IjoxNjU3NTI4MzY4fQ.c_ITRSMIvyYPUfd292a4akwnpAnsFTlVkn4XZ4TUvMk';
  const _expired_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJ0ZXN0IiwiZXhwaXJlc19pbiI6MTY1NzUzMTk2OCwiaWF0IjoxNjU3NTI4MzY4fQ.c_ITRSMIvyYPUfd292a4akwnpAnsFTlVkn4XZ4TUvMk';

  before(function(done) {
    app = require('../app');
    app.on("started", function(){
      console.log('Start api service [ Before ] test \n');
      done();
    });
  });

  describe('O AUTH 2 APIs', () => {

    describe('/POST api/oauth/accessToken', () => {

        it('send with empty,it should return 422', (done) => {
          chai.request(app)
              .post('/api/oauth/accessToken')
              .send({})
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error', 'msg');
                  res.body.error.should.be.eql(true);
                done();
              });
        });

        it('send with wrong grant_type,it should return 401', (done) => {
          chai.request(app)
              .post('/api/oauth/accessToken')
              .send({grant_type:"test",client_id:"test",client_secret:1234})
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');
                done();
              });
        });

        it('send with wrong client_id,it should return 401', (done) => {
          chai.request(app)
              .post('/api/oauth/accessToken')
              .send({grant_type:"client_credentials",client_id:"a",client_secret:1234})
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');
                done();
              });
        });

        it('send with wrong client_secret,it should return 401', (done) => {
          chai.request(app)
              .post('/api/oauth/accessToken')
              .send({grant_type:"client_credentials",client_id:"test",client_secret:0003453})
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');
                done();
              });
        });

        it('it should return success case with status 200', (done) => {
          chai.request(app)
              .post('/api/oauth/accessToken')
              .send(access_token_body)
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('access_token', 'expires_in','token_type');
                  _correctToken = res.body.access_token;
                  bearerToken = `Bearer ${_correctToken}`;
                done();
              });
        });

    });

    describe('/POST api/oauth/verify', () => {

        it('send with empty,it should return 422', (done) => {
          chai.request(app)
              .post('/api/oauth/verify')
              .send({})
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error', 'msg');
                  res.body.error.should.be.eql(true);
                done();
              });
        });

        it('send correct token,it should return success case with status 200', (done) => {
          chai.request(app)
              .post('/api/oauth/verify')
              .send({access_token:_correctToken})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('client_id', 'expires_in');
                  res.body.client_id.should.be.eql(access_token_body.client_id);
                done();
              });
        });

        it('send expired token,it should return status 401', (done) => {
          chai.request(app)
              .post('/api/oauth/verify')
              .send({access_token:_expired_token})
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');

                done();
              });
        });

    });

  });

  describe('Email APIs', () => {
    describe('/POST api/email/send', () => {

      it('send expired token,it should return status 401', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearer_expored_token)
              .send({
                to : 'test',
                subject : 'test',
                message : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');
                done();
              });
        });

      it('send with missing param to,it should return status 422', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearerToken)
              .send({
                subject : 'test',
                message : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error','msg');
                  res.body.error.should.be.eql(true);
                done();
              });
        });

      it('send with missing param subject,it should return status 422', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearerToken)
              .send({
                to : 'test@gmail.com',
                message : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error','msg');
                  res.body.error.should.be.eql(true);
                done();
              });
      });

      it('send with missing param message,it should return status 422', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearerToken)
              .send({
                to : 'test@gmail.com',
                subject : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error','msg');
                  res.body.error.should.be.eql(true);
                done();
              });
      });

      it('send with wrong email format,it should return status 422', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearerToken)
              .send({
                to : 'test',
                subject : 'test',
                message : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error');

                done();
              });
      });

      it('send with correct data,it should return status 200', (done) => {
          chai.request(app)
              .post('/api/email/send')
              .set('Authorization', bearerToken)
              .send({
                to : 'test@gmail.com',
                subject : 'test',
                message : 'test',
              })
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('status');
                  res.body.status.should.be.eql('success');
                done();
              });
      });

    });
  });

  describe('Contact APIs', () => {

    describe('/POST /api/contracts', () => {

      it('send expired token,it should return status 401', (done) => {
          chai.request(app)
              .post('/api/contracts')
              .set('Authorization', bearer_expored_token)
              .send({
                user_id : 1
              })
              .end((err, res) => {
                  res.should.have.status(401);
                  res.body.should.have.all.keys('error');
                done();
              });
      });

      it('send with empty body,it should return status 422', (done) => {
          chai.request(app)
              .post('/api/contracts')
              .set('Authorization', bearerToken)
              .send({})
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error','msg');
                  res.body.error.should.be.eql(true);
                done();
              });
      });

      it('send with correct body,it should return status 200 with contact', (done) => {
          chai.request(app)
              .post('/api/contracts')
              .set('Authorization', bearerToken)
              .send({user_id:1})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('contacts');
                done();
              });
      });

    });

  });

  describe('Tex APIs', () => {

    describe('/GET tex', () => {

      it('send empty parameter,it should return status 402', (done) => {
          chai.request(app)
              .get('/tex')
              .end((err, res) => {
                  res.should.have.status(422);
                  res.body.should.have.all.keys('error','msg');
                  res.body.error.should.be.eql(true);
                done();
              });
        });

        it('send 150000,it should return 0', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '150000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(0);
                done();
              });
        });

        it('send 300000,it should return 7500', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '300000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(7500);
                done();
              });
        });

        it('send 500000,it should return 27500', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '500000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(27500);
                done();
              });
        });

        it('send 750000,it should return 65000', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '750000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(65000);
                done();
              });
        });

        it('send 1000000,it should return 115000', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '1000000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(115000);
                done();
              });
        });

        it('send 2000000,it should return 365000', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '2000000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(365000);
                done();
              });
        });

        it('send 5000000,it should return 1265000', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '5000000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.eql(1265000);
                done();
              });
        });

        it('send 6000000,it should return 1265000 ++', (done) => {
          chai.request(app)
              .get('/tex')
              .query({net_Income: '6000000'})
              .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.all.keys('PIT');
                  res.body.PIT.should.be.above(1265000);
                done();
              });
        });

    });

  });

});