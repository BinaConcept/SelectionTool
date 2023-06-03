/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Buffer } from 'buffer';
import React, {
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
	useParams,
	useCallback,
} from 'react';
import { fabric } from 'fabric';
import { Button } from '../atomic/molecules/button';
import axios from 'axios';
import adminService from '../service/adminService';
import { toast } from 'react-toastify';

export const PolyFabric = forwardRef((props, ref) => {
	const [obj, setobj] = useState([]);
	const data = [0, 0, 0, 0, 0];
	const objList = useRef([]);
	const polygonLine = [];
	const circle = [];

	let selectedItem;
	let refy = useRef(1);

	const [show, showList] = useState(false);
	const [display, setDisplay] = useState(false);
	let visibility = useRef(true);

	const [objectDetection, setObjectDetection] = useState([
		{
			id: 0,
			selected: 0,
			polygon: [],
		},
	]);

	const createObject = (objData) => {
		let selectIndx = objData.selectedIndex;

		var answer = window.confirm(
			`Ben je zeker dat je object wilt toevoegen met de id ${selectIndx}`
		);

		if (answer) {
			const newItems = [
				{
					id:
						objectDetection.length > 1
							? objectDetection[objectDetection.length - 2].id + 1
							: objectDetection[0].id + 1,
					selected: objData.selectedIndex,
					polygon: [],
				},
				...objectDetection,
			];
			objList.current = newItems;
			newItems.sort((a, b) => (b.id !== 0 ? a.id - b.id : null));
			setObjectDetection(newItems);
			refy.current = objectDetection.length - 1;
		}
	};

	const deleteObject = (index) => {
		setObjectDetection(objectDetection.filter((item, i) => i !== index));
		refy.current = refy.current - 1;
	};

	const editObject = (i, objData) => {
		const updatedArray = [
			...objectDetection.slice(0, i),
			{
				// here update data value
				...objectDetection[i],
				selected: objData.selectedIndex,
			},
			...objectDetection.slice(i + 1),
		];
		setObjectDetection(updatedArray);
	};

	useEffect(() => {
		if (show === true && props.imageLoading === false) {
			setObjectDetection((dt) => [
				...objectDetection.slice(
					objectDetection.length - 1,
					objectDetection.length,
					setobj([])
				),
			]);
		}
	}, [props.imageLoading, show]);

	const hid = () => {
		let status = display === false ? 'disable' : 'enable';
		setDisplay(status === 'disable' ? true : false);
		adminService.getDisplayBlock(props.cameraIp, status).then((response) => {
			toast.success('Privacy mode');
			visibility.current = status === 'disable' ? true : false;
			handleSubmit(visibility);
		});
	};

	useImperativeHandle(ref, () => ({
		enableDisable() {
			hid();
		},

		store() {
			adminService.getStore(props.cameraIp).then((response) => {
				toast.success('Gegevens zijn permanent opgeslagen');
				hid();
			});
		},
	}));

	const createMotionList = (m) => {
		const reTx = m.data.replace(/:/g, ' ');
		const spTx1 = reTx.split('ima=');
		obj.length = 0;
		setobj([
			...obj,
			{
				id: 0,
				name: 'Kies object',
			},
		]);
		for (let i = 1; i < spTx1.length + 1; i++) {
			if (spTx1[i - 1].indexOf('_profilename') > -1) {
				let nuberP = spTx1[i - 1].indexOf('_profilename');
				let nuberL = spTx1[i - 1].indexOf('vm_list');
				let subL = spTx1[i - 1].substring(nuberL + 8);
				let reL = subL.replace(/\n/g, '');

				setobj((objData) => [
					...objData,
					{
						id: i - 1,
						name: spTx1[i - 1].substring(
							nuberP + 13,
							spTx1[i - 1].indexOf('ima_dead')
						),
						value: parseInt(reL),
					},
				]);
			}
		}
	};

	useEffect(() => {
		let polyList;
		let offsetX = 86;
		let offsetX1 = 785 / 1152;
		let offsetY = 941;
		let offsetY1 = 565 / 941;
		if (props.imageLoading) {
			showList(true);
			adminService
				.getMotions(props.cameraIp)
				.then(
					(res) => createMotionList(res),
					toast.success('Success verbinding')
				);
			adminService.getLoadingCameraData(props.cameraIp).then((res) => {
				const reTx = res.data.replace(/\n/gi, '');
				const reTx1 = reTx.replace(/x/gi, ',');
				const reTx2 = reTx1.replace(/\//gi, ',');
				const spTx1 = reTx2.split(/%0A/g);
				let value = spTx1.slice(3, spTx1.length);

				value.map((valData, i) => {
					let calSplit = valData.slice(2).split(/,/g);
					let id = calSplit[calSplit.length - 1].replace(/id=/g, '');

					if (calSplit[0].substring(0, 5) === 'poly=') {
						const reTx = calSplit[0].replace(/poly=/gi, '');
						calSplit[0] = reTx;
						const arrPoly = [];

						for (let i = 0; i < calSplit.length - 3; i += 2) {
							arrPoly.push({
								x: (parseInt(calSplit[i]) - offsetX) * offsetX1,
								y: parseInt((offsetY - calSplit[i + 1]) * offsetY1),
							});
						}
						setObjectDetection((dt) => [
							{
								id: objectDetection.length + 1,
								selected: id,
								polygon: arrPoly,
							},
							...dt,
						]);
					} else {
						setObjectDetection((dt) => [
							{
								id: objectDetection.length + 1,
								selected: id,
								polygon: [
									{
										x: parseInt((parseInt(calSplit[0]) - offsetX) * offsetX1),
										y: parseInt(
											(offsetY -
												parseInt(
													parseInt(calSplit[1]) + parseInt(calSplit[3])
												)) *
												offsetY1
										),
									},
									{
										x: parseInt(
											(parseInt(calSplit[0]) +
												parseInt(calSplit[2]) -
												offsetX) *
												offsetX1
										),
										y: parseInt(
											(offsetY -
												parseInt(
													parseInt(calSplit[1]) + parseInt(calSplit[3])
												)) *
												offsetY1
										),
									},
									{
										x: parseInt(
											(parseInt(calSplit[0]) +
												parseInt(calSplit[2]) -
												offsetX) *
												offsetX1
										),
										y: parseInt(
											(offsetY - parseInt(parseInt(calSplit[1]))) * offsetY1
										),
									},
									{
										x: parseInt((parseInt(calSplit[0]) - offsetX) * offsetX1),
										y: parseInt(
											(offsetY - parseInt(parseInt(calSplit[1]))) * offsetY1
										),
									},
								],
							},
							...dt,
						]);
						refy.current = i + 1;
					}
				});
			});
		}
	}, [props.imageLoading]);

	const objectList = obj.map((data, i) => {
		return (
			<option key={i} value={i}>
				{data.name}
			</option>
		);
	});

	objList.current = objectDetection;

	const send = (object) => {
		let polyList;
		let offsetX = 86;
		let offsetX1 = 1152 / 785;
		let offsetY = 941;
		let offsetY1 = 941 / 565;

		object.polygon.map((subData, a) => {
			let vx = parseInt(subData.x * offsetX1 + offsetX);
			let vy = parseInt(offsetY - parseInt(subData.y) * offsetY1);
			if (polyList === undefined) {
				polyList = vx + 'x' + vy;
			} else {
				polyList = polyList + (vx + 'x' + vy);
			}
			if (a !== object.polygon.length - 1) {
				polyList = polyList + '/';
			}
		});

		return polyList;
	};

	const apiSend = (sendObject) => {
		let sendData = '';

		if (sendObject.length === undefined) {
			sendData += `$noiseadjust=1%0A$postfilter=1%0A$limit=100%0A0,poly=${send(
				sendObject
			)},s=0,a=5,id=${sendObject.id}`;
		} else {
			sendObject.map((data, i) => {
				if (data.id !== 0) {
					if (i === 0) {
						sendData += `$noiseadjust=1%0A$postfilter=1%0A$limit=100%0A0,poly=${send(
							data
						)},a=5,am=90,s=0,id=${data.id}%0A`;
					} else {
						sendData += `0,poly=${send(data)},a=5,am=90,s=0,id=${data.id}%0A`;
					}
				}
			});
		}
		const url = `http://${props.cameraIp}/control/control?set&section=eventcontrol&motion_area=${sendData}`;
		const data = {
			username: 'admin',
			password: 'meinsm123',
		};
		axios
			.get(url, data)
			.then((response) => {})
			.catch((error) => {
				console.log(error);
			});
	};

	const addObjectDetection = () => {
		if (objectDetection) {
			const obDetect = () =>
				objectDetection.map((data, i) => (
					<div className="row" key={i}>
						<div className="col-lg-6">
							{i === 0 ? (
								<div className="input-group mb-3">
									<Button
										className="w-100 btn-warning"
										disabled={objectDetection.length > 1 ? false : true}
										onClick={() => apiSend(objectDetection)}
									>
										ALL
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-send mb-1 mx-1"
											viewBox="0 0 16 16"
										>
											<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
										</svg>
									</Button>
								</div>
							) : null}

							<div className="input-group mb-3">
								{objectDetection.length !== i + 1 ? (
									<Button
										className="btn-warning"
										onClick={() => deleteObject(i)}
									>
										-
									</Button>
								) : null}
								<select
									className="form-select"
									aria-label="Default select example"
									value={data.selected === 0 ? 0 : data.selected}
									onChange={(e) =>
										data.selected === 0
											? createObject(e.target)
											: editObject(i, e.target)
									}
									onClick={() => (refy.current = i + 1)}
								>
									{objectList}
								</select>
								{objectDetection.length !== i + 1 ? (
									<Button
										className="btn-warning"
										onClick={() => apiSend(objectDetection[i])}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-send"
											viewBox="0 0 16 16"
										>
											<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
										</svg>
									</Button>
								) : null}
							</div>
						</div>

						<div className="row">
							<div className="col-lg-6"></div>
						</div>
					</div>
				));

			return obDetect();
		}
	};

	const handleSubmit = useCallback((setPrivacy) => {
		var canvas = new fabric.Canvas('c');
		let canvasW = 750;
		let canvasH = 550;
		canvas.setWidth(canvasW);
		canvas.setHeight(canvasH);

		canvas.on('object:moving', (e) => {
			var p = e.target;
			objList.current[p.parentId].polygon[p.id] = {
				x: p.getCenterPoint().x,
				y: p.getCenterPoint().y,
			};
		});

		canvas.on('mouse:over', (e) => {
			if (e.target !== null) {
				if (e.target.id === undefined) {
					refy.current = e.target.parentId + 1;
				}
			}
		});

		canvas.on('mouse:out', (e) => {
			data[0] = 0;
		});

		canvas.on('selection:created', (e) => {
			data[0] = 1;
			selectedItem = {
				parentId: e.selected[0].parentId,
				nodeId: e.selected[0].id,
			};
		});

		canvas.on('mouse:down', (e) => {
			let _left = e.pointer.x;
			let _top = e.pointer.y;

			if (objList.current.length > 1 && data[0] === 0) {
				const newPolygon = {
					...objList.current,
					...objList.current[refy.current - 1].polygon.push({
						x: _left,
						y: _top,
					}),
				};
			}
		});

		canvas.on('mouse:up', (e) => {
			if (refy.current > 0) {
				canvas.clear();
				node();
			}
		});

		fabric.util.addListener(
			document.getElementsByClassName('upper-canvas')[0],
			'contextmenu',
			function (e) {
				e.preventDefault();
				if (e.button >= 0) {
					if (selectedItem.nodeId !== undefined) {
						objList.current[selectedItem.parentId].polygon.splice(
							selectedItem.nodeId,
							1
						);
					} else {
						objList.current.splice(selectedItem.parentId, 1);
					}
					canvas.clear();
					node();
					data[0] = 0;
				}
			}
		);
		const node = () => {
			objList.current.map((dataPoint, a) => {
				const options = {
					visible: visibility.current | false,
					objectCaching: false,
					fill: '	rgb(255,0,0,0.7)',
					stroke: 'rgb(255,0,0,0.2)',
					text: 'ROI',
					evented: true,
					hasControls: false,
					selectable: false,
					parentId: a,
				};
				polygonLine[a] = new fabric.Polyline(dataPoint.polygon, options);
				canvas.add(polygonLine[a]);

				dataPoint.polygon.map((point, b) => {
					circle[b] = new fabric.Circle({
						visible: visibility.current | false,
						radius: 5,
						fill: 'white',
						stroke: 'red',
						left: point.x,
						top: point.y,
						originX: 'center',
						originY: 'center',
						hasControls: false,
						parentId: a,
						id: b,
						fireRightClick: true,
						fireMiddleClick: true,
						stopContextMenu: true,
					});
					canvas.add(circle[b]);
				});
			});
		};
		node();
	}, []);

	useEffect(() => {
		handleSubmit();
	}, [objectDetection]);

	return <>{addObjectDetection()}</>;
});
