const fs = require('fs');
const path_groups_file = './mock_database/groups.json';
const path_contact_file = './mock_database/contacts.json';
const app = {
	getContractByUser : async (user_id)=> {
		const userId = (Number.isInteger(user_id)) ? user_id : 0;
		if(!userId){ return []; }

		const lists = JSON.parse(fs.readFileSync(path_contact_file, 'utf8'));
		const groups = JSON.parse(fs.readFileSync(path_groups_file, 'utf8'));

		let listbyUser = lists.filter(function (el) { return el.user_id === user_id; });

    	let obj = {};
    	for (var i = listbyUser.length - 1; i >= 0; i--) {

    		//const group_index = listbyUser[i].group_id - 1;
    		const group_obj = groups.find(o => o.id === listbyUser[i].group_id);
    		const group_name = group_obj.group_name;

    		if(typeof obj[group_name] === 'undefined'){
    			obj[group_name] = {
    				id: group_obj.id,
    				list:[]
    			};
    		}

    		obj[group_name].list.push(listbyUser[i]);

    	}

    	return obj;
	},
	addNewGroup : async (group_name) =>{

		let groups = JSON.parse(fs.readFileSync(path_groups_file, 'utf8'));
		const group_obj = groups.find(o => o.group_name === group_name);
		if(typeof group_obj !== 'undefined'){
			return true; //recycle data
		}

		const new_obj = {
			id: groups[groups.length-1].id + 1,
			group_name: group_name
		}

		groups.push(new_obj);

		try {
		  fs.writeFileSync(path_groups_file, JSON.stringify(groups));
		  return true;
		} catch(err) {
		  console.error(err);
		  return false;
		}

	},
	//updateGroup
	//deleteGroup
	addNewContact : async (obj) => {
		
		const lists = JSON.parse(fs.readFileSync(path_contact_file, 'utf8'));

		obj.id = lists[lists.length-1].id + 1;

		lists.push(obj);

		try {
		  fs.writeFileSync(path_contact_file, JSON.stringify(lists));
		  return true;
		} catch(err) {
		  console.error(err);
		  return false;
		}

	}
	//updateContact
	//deleteContact
};

module.exports = app;