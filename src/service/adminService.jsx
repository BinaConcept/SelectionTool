// /* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';

const authorization = {
	username: 'admin',
	password: 'meinsm123',
};

class AdminService {
	//Event Overview
	getMotions(ip) {
		axios
			.get(
				`http://${ip}/control/control?read&section=event_ima&ima`,
				authorization
			)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	//Create motions line
	createMotionLine(ip, motion) {
		axios
			.get(
				`http://${ip}/control/control?set&section=eventcontrol&motion_area=${motion}`,
				authorization
			)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.log(error);
			});
	}
	// Display mode
	getDisplayBlock(ip, display) {
		axios
			.get(
				`http://${ip}/admin/control?set&section=logo&display=${display}`,
				authorization
			)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	//Configuration store
	getStore(ip) {
		axios
			.get(`http://${ip}/admin/rcontrol?action=storeconfig`, authorization)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.log(error);
			});
	}
}

export default new AdminService();
