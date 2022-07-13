const express = require('express')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const config = require('dotenv').config();

const sendGrid = require(__dirname+'/controller/sendgridController');
const contacts = require(__dirname+'/controller/contactListController');
const tex = require(__dirname+'/controller/texController');
const port = process.env.PORT || 3000;
const privateKey = process.env.PRIVATE_KEY || fs.readFileSync('private.key');
const clientDBPath = './mock_database/client.json';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(function(req, res, next){

  if(req.originalUrl.includes('oauth')){
    return next();
  }

  if(!req.originalUrl.includes('api')){
    return next();
  }

  if((typeof req.headers.authorization === 'undefined')||(req.headers.authorization === '')||(req.headers.authorization.split(" ")[0] !== "Bearer")){
    res.status(401).send("invalid token...");
  }

  try {

    const decoded = jwt.verify(req.headers.authorization.split(" ")[1], privateKey);
    const client = JSON.parse(fs.readFileSync(clientDBPath, 'utf8'));
    let obj = client.find(o => o.client_id === decoded.client_id);
    if(typeof obj !== 'undefined'){

      if(isExpired(decoded.expires_in)){
        return res.status(401).json({
          error : 'token is already expired'
        });
      }

      next();
    }else{
      res.status(401).json({
        error:'token mismatch'
      });
    }

  } catch(err) {
    res.status(401).json({
      error:err
    });
  }
  

});

function isExpired(timestamp) {
  if (timestamp < new Date()/1000) {
    return true;
  }

  return false;
}

function parameter_check(param,error_message=''){
  if(error_message!=''){ error_message = `missing ${error_message}.` }
  if((typeof param == 'undefined')||param == ''||param == null){
    return {status:422,data:{error:true,msg:`parameter is incorrect. ${error_message}`}};
  }else{
    return {status:200};
  }
}

function isEmpty(obj) {
    if(Object.keys(obj).length === 0){
      return {status:404,data:{error:true,msg:`empty all parameter`}};
    }else{
      return {status:200};
    }
}

function validateEmail(email){
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}


app.post('/api/oauth/accessToken' , async (req,res) => {
// client_credentials
  let result = {status:200};

  const grant_type = req.body.grant_type;
  result = parameter_check(grant_type,'grant_type');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  if(grant_type!=='client_credentials'){
    return res.status(401).json({error:`grant_type is incorrect.`});
  }

  const client_id = req.body.client_id;
  result = parameter_check(client_id,'client_id');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const client_secret = req.body.client_secret;
  result = parameter_check(client_secret,'client_secret');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const client = JSON.parse(fs.readFileSync(clientDBPath, 'utf8'));
  let obj = client.find(o => o.client_id === client_id);

  if(typeof obj === 'undefined'){
    return res.status(401).json({
        error : 'client_id is incorrect'
    });
  }

  if(obj.client_secret != client_secret){
    return res.status(401).json({
        error : 'client_secret is incorrect'
    });
  }

  const expires_in = Math.floor(Date.now() / 1000) + (60 * 60);
  const token_data = { client_id: client_id , expires_in:expires_in  };

  const token = jwt.sign(token_data, privateKey);
  //const token = jwt.sign(token_data, privateKey, { algorithm: 'RS256'}); for PEM file

  res.json({
    access_token : token,
    expires_in : expires_in,
    token_type : "Bearer"
  });
  
});

app.post('/api/oauth/verify' , async (req,res) => {

  let result = {status:200};

  const access_token = req.body.access_token;
  result = parameter_check(access_token,'access_token');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  try {

    const decoded = jwt.verify(access_token, privateKey);

    if(isExpired(decoded.expires_in)){
      return res.status(401).json({
        error : 'token is already expired'
      });
    }

    res.json({
      client_id : decoded.client_id,
      expires_in : decoded.expires_in
    });

  } catch(err) {
    res.json({
      error:err
    });
  }


});

app.post('/api/email/send', async (req, res) => {

  let result = {status:200};

  const to  = req.body.to;
  result = parameter_check(to,'to');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  if(!validateEmail(to)){
    return res.status(422).json({
        error : 'incorrect email'
    });
  }

  const subject  = req.body.subject;
  result = parameter_check(subject,'subject');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const message  = req.body.message;
  result = parameter_check(message,'message');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  let content = {
    subject: subject,
    text: message,
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>'
  };

  const send_result = await sendGrid.sendEmail(to,content);
  const status = (send_result) ? "success" : "failed";
  res.json({
    status: status
  });

});

app.post('/api/contracts', async (req, res) => {

  let result = {status:200};

  let user_id  = req.body.user_id;
  result = parameter_check(user_id,'user_id');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  let contact_list = await contacts.getContractByUser(parseInt(user_id));

  res.json({
    contacts : contact_list
  });

});

app.put('/api/contract/groups', async (req, res) => {

  let result = {status:200};

  const group_name  = req.body.group_name.toLowerCase();
  result = parameter_check(group_name,'group_name');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  let add_result = await contacts.addNewGroup(group_name);
  const status = (add_result) ? "success" : "failed";

  res.json({
    status : status
  });

});

app.put('/api/contract', async (req, res) => {

  let result = {status:200};

  const user_id  = req.body.user_id;
  result = parameter_check(user_id,'user_id');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const group_id  = req.body.group_id;
  result = parameter_check(group_id,'group_id');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const first_name  = req.body.first_name;
  result = parameter_check(first_name,'first_name');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const last_name  = req.body.last_name;
  result = parameter_check(last_name,'last_name');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const birth_date  = req.body.birth_date;
  result = parameter_check(birth_date,'birth_date');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  const phone = req.body.phone || null;
  const email = req.body.email || null;
  const url = req.body.url || null;

  let obj = {
    user_id : user_id,
    group_id : group_id,
    first_name : first_name,
    last_name : last_name,
    birth_date : birth_date,
    phone : phone,
    email : email,
    url : url
  };

  let add_result = await contacts.addNewContact(obj);
  const status = (add_result) ? "success" : "failed";

  res.json({
    status : status
  });

});

app.get('/tex', async (req, res) => {

  let result = {status:200};

  let net_Income = req.query.net_Income;
  result = parameter_check(net_Income,'net_Income');
  if(result.status!=200){ return res.status(result.status).json(result.data); }

  net_Income = ( isNaN(parseFloat(net_Income)) ) ? 0 : parseFloat(net_Income);

  res.json({
    PIT : await tex.PIT_Calculate(net_Income)
  });

});


app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  app.emit("started");
});

module.exports = app;