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
} from 'react';
import { fabric } from 'fabric';
import { Button } from '../atomic/molecules/button';
import axios from 'axios';

export const PolyFabric = forwardRef((props, ref) => {
	const [obj, setobj] = useState([]);
	const data = [0, 0, 0, 0, 0];
	const polygonLine = [];
	const circle = [];
	let selectedItem;
	let refy = useRef(0);
	const [display, setDisplay] = useState(false);

	const [objectDetection, setObjectDetection] = useState([
		{
			id: 0,
			selected: 0,
			polygon: [],
		},
	]);
	const objList = useRef([]);
	const createObject = (objData) => {
		var answer = window.confirm(
			'Ben je zeker dat je object wilt toevoegen met de id',
			objData.selectedIndex
		);

		if (answer) {
			const newItems = [
				{
					id: objectDetection.length + 1,
					selected: objData.selectedIndex,
					polygon: [],
				},
				...objectDetection,
			];
			objList.current = newItems;
			newItems.sort((a, b) => (b.id !== 0 ? a.id - b.id : null));
			setObjectDetection(newItems);
			refy.current = objectDetection.length;
			console.log('Create', objectDetection);
		}
	};
	const deleteObject = (index) => {
		setObjectDetection(objectDetection.filter((item, i) => i !== index));
		refy.current =
			refy.current === 2 ? refy.current - 3 : objectDetection.length;
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

	useImperativeHandle(ref, () => ({
		async enableDisable() {
			let status = display === false ? 'disable' : 'enable';
			setDisplay(status === 'disable' ? true : false);
			console.log('enableDisable', status);

			const url = `http://${props.cameraIp}/admin/control?set&section=logo&display=disable`;

			var base64encodedData = Buffer.from('admin:meinsm123').toString('base64');

			const response = await axios.get('http://192.168.24.115/admin/control', {
				params: {
					section: 'logo',
					admin: 'null',
					set: 'null',
					display: 'enable',
				},
				headers: {
					Authorization: 'Basic YWRtaW46bWVpbnNtMTIz',
				},
			});
		},

		store() {
			let url = `http://${props.cameraIp}/admin/rcontrol?action=storeconfig`;
			axios
				.get(url)
				.then((response) => {})
				.catch((error) => {
					console.log(error);
				});

			console.log('opsla');
		},
	}));

	useEffect(() => {
		if (props.imageLoading) {
			const url = `http://${props.cameraIp}/control/control?read&section=event_ima&ima`;
			axios
				.get(url)
				.then((response) => {
					const txt = response.data;
					const reTx = txt.replace(/:/g, ' ');
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
				})
				.catch((error) => {
					console.log(error);
				});
		}
		console.log('loading drop downlist');
	}, []);

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
			)},a=5,am=90,s=0,id=${sendObject.id}%0A`;
		} else {
			sendObject.map((data, i) => {
				if (data.id !== 0) {
					sendData += `$noiseadjust=1%0A$postfilter=1%0A$limit=100%0A0,poly=${send(
						data
					)},a=5,am=90,s=0,id=${data.id}%0A`;
				}
			});
		}
		const url = `http://${props.cameraIp}/control/control?set&section=eventcontrol&motion_area=motion_area=${sendData}`;
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
	useEffect(() => {
		let canvasW = 750;
		let canvasH = 550;

		var canvas = new fabric.Canvas('c');
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
			if (refy.current > 0 && data[0] === 0) {
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
	}, [objectDetection]);

	return <>{addObjectDetection()}</>;
});
