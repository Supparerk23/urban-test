
const app = {
	sendEmail : async (to,content)=> {
		const sgMail = require('@sendgrid/mail');
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);

		// const msg = {
		//   to: to,
		//   from: 'test@example.com', // Use the email address or domain you verified above
		//   subject: content.subject,
		//   text: content.text,
		//   html: content.html
		// };

		// SandBox Environments : mail_settings

		const msg = {
		    to: to,
		  	from: 'test@example.com', // Use the email address or domain you verified above
		  	subject: content.subject,
		  	text: content.text,
		  	html: content.html,
		    mail_settings: {
		        "sandbox_mode": {
		            "enable": true
		        }
		    }
		};

		
		try {
		    let res = await sgMail.send(msg);

		   	if(res.length>0){
		    	if(res[0].statusCode==200){
		    		return true
		    	}
		   	};
		   	console.log(res); // for another case of server status != 200
		    return false;
		} catch (error) {
		    console.error(error);

		    if (error.response) {
		      console.error(error.response.body)
		    }

		    return false;
		}
		
	}
};

module.exports = app;