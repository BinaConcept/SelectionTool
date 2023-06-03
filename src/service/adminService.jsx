// /* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';

const authorization = {
	username: 'admin',
	password: 'meinsm123',
};

class AdminService {
	//Event Overview

	getMotions(ip) {
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/control/control?read&section=event_ima&ima`
			)
			.catch((error) => {
				console.log(error);
			});
	}

	//Create motions line
	createMotionLine(ip, motion) {
		axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/control/control?set&section=eventcontrol&motion_area=${motion}`
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
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/admin/control?set&section=logo&display=${display}`
			)
			.catch((error) => {
				console.log(error);
			});
	}

	//Configuration store
	getStore(ip) {
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/admin/rcontrol?action=storeconfig`
			)

			.catch((error) => {
				console.log(error);
			});
	}

	//Configuration store
	getLoadingCameraData(ip) {
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/control/control?read&section=eventcontrol&motion_area`
			)
			.catch((error) => {
				console.log(error);
			});
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AdminService();
