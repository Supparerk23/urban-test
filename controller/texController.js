
const app = {
	percentage : (value,percent) => {
		return ((value/100)*percent);
	},
	PIT_Calculate : async (net_Income)=> {

		if(net_Income<=150000){
			return 0;
			
		}else if( ((net_Income>150000))&&(net_Income<=300000) ) {
			return app.percentage((net_Income-150000),5); //top 7500

		}else if( ((net_Income>300000))&&(net_Income<=500000) ) {
			return ( app.percentage((net_Income-300000),10) ) + 7500; //top 27500

		}else if( ((net_Income>500000))&&(net_Income<=750000) ) {
			return ( app.percentage((net_Income-500000),15) ) + 27500; //top 65000

		}else if( ((net_Income>750000))&&(net_Income<=1000000) ) {
			return ( app.percentage((net_Income-750000),20) ) + 65000; //top 115000

		}else if( ((net_Income>1000000))&&(net_Income<=2000000) ) {
			return ( app.percentage((net_Income-1000000),25) ) + 115000; //top 365000

		}else if( ((net_Income>2000000))&&(net_Income<=5000000) ) {
			return ( app.percentage((net_Income-2000000),30) ) + 365000; //top 1265000

		}else if( (net_Income>5000000) ) {
			return ( app.percentage((net_Income-5000000),35) ) + 1265000; //min 1265000

		}
		
	}
};

module.exports = app;