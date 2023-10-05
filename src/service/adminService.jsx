// /* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';
import { toast } from 'react-toastify';

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
			.then((res) => {
				if (res.status === 200) {
					toast.success('Detectiezone is met success verzonden.');
				}
			})
			.catch((error) => {
				console.log(error);
				toast.warning('Detectiezone is niet aangemaakt.');
			});
	}

	// Display mode
	getDisplayBlock(ip, display) {
		axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/admin/control?set&section=logo&display=${display}`
			)
			.then((res) => {
				if (res.status === 200) {
					toast.success('Display mode met success veranderd.');
				}
			})
			.catch((error) => {
				console.log(error);
				toast.warning('Display mode niet kunnen aanpassen.');
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
	//Send data to camera

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

	//Get IMA data
	getLoadingIma(ip) {
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/control/control?read&section=event_ima&ima`
			)
			.catch((error) => {
				console.log(error);
			});
	}

	createVMListIma(ip, ima, id) {
		return axios
			.get(
				`http://${authorization.username}:${authorization.password}@${ip}/control/control?section=event_ima&set_profile=ima:${ima}&vm_list=${id}`,
				
			)
			.catch((error) => {
				console.log(error);
			});
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AdminService();
