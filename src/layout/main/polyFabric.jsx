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
import { Button } from '../../atomic/molecules/button';
import axios from 'axios';
import adminService from '../../service/adminService';

export const PolyFabric = forwardRef((props, ref) => {
	// useState
	const [obj, setobj] = useState([]);
	const [show, showList] = useState(false);
	const [display, setDisplay] = useState(false);

	// useRef
	let visibility = useRef(true);
	const objList = useRef([]);
	let refy = useRef(0);
	let selectList = useRef([]);

	// array
	const data = [0, 0, 0, 0, 0];
	const polygonLine = [];
	const circle = [];

	// variable
	let selectedItem;

	// First objectdetection array
	const [objectDetection, setObjectDetection] = useState([
		{
			id: 0,
			selected: 0,
			polygon: [],
		},
	]);

	objList.current = objectDetection;

	const selectMaxValue = (valData) => {
		const maxId = valData.reduce((max, currentItem) => {
			return currentItem.id > max ? currentItem.id : max;
		}, 0);
		let indx = valData.findIndex((item) => item.id === maxId);
		refy.current = valData[indx] + (indx !== 0 ? 1 : 1);
	};

	// Create objectdetection
	const createObject = (objData) => {
		const selectIndx = objData.selectedIndex;
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

					selected: selectIndx,
					polygon: [],
				},
				...objectDetection,
			];
			objList.current = newItems;
			newItems.sort((a, b) => (b.id !== 0 ? a.id - b.id : null));

			// Verplaats de eerste index naar de laatste index met de spread-operator
			const newArray = [...newItems.slice(1), newItems[0]];
			setObjectDetection(newArray);
			selectMaxValue(newArray);
		}
	};

	// Delete objectdetection
	const deleteObject = (index) => {
		var filteredArray = objectDetection.filter(function (item, i) {
			return i !== index;
		});

		setObjectDetection(filteredArray);
		selectMaxValue(filteredArray);
	};

	// Edit objectdetection
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

	// Check loading camera image
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

	// Set privacymode disable-enable
	const hid = () => {
		let status = display === false ? 'disable' : 'enable';
		setDisplay(status === 'disable' ? true : false);
		adminService.getDisplayBlock(props.cameraIp, status);
		// const response = adminService
		// 	.getDisplayBlock(props.cameraIp, status)
		// 	.then((res) => {
		// 		// console.log('status: ', res.response);
		// 		// toast.success('Privacy mode');
		// 		// visibility.current = status === 'disable' ? true : false;
		// 		// handleSubmit(visibility);
		// 	});
		// console.log(response);
	};

	// Event others component
	useImperativeHandle(ref, () => ({
		enableDisable() {
			hid();
		},
		// Toast message
		store() {
			adminService.getStore(props.cameraIp).then((response) => {
				// toast.success('Gegevens zijn permanent opgeslagen');
				hid();
			});
		},
	}));

	// Loading motionlist from camera
	const createMotionList = (m) => {
		const reTx = m.data.replace(/:/g, ' ');
		const value = reTx.split('ima=');

		let spTx1 = value.slice(1, value.length);

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
				let ky = spTx1[i - 1].substring(0, spTx1[i - 1].indexOf(' '));
				let nuberL = spTx1[i - 1].indexOf('vm_list');
				let subL = spTx1[i - 1].substring(nuberL + 8);
				let reL = subL.replace(/\n/g, '');
				let x = subL;
				setobj((objData) => [
					...objData,
					{
						id: i,
						name: spTx1[i - 1].substring(
							nuberP + 13,
							spTx1[i - 1].indexOf('ima_dead') - 1
						),
						key: ky,
					},
				]);
			}
		}
	};

	// Loading objectdetection list from camera
	useEffect(() => {
		let polyList;
		let offsetX = 86;
		let offsetX1 = 785 / 1152;
		let offsetY = 941;
		let offsetY1 = 565 / 941;
		if (props.imageLoading) {
			showList(true);
			adminService.getMotions(props.cameraIp).then(
				(res) => createMotionList(res)
				// toast.success('Success verbinding')
			);

			adminService.getLoadingCameraData(props.cameraIp).then((res) => {
				const mobValue = [];
				const idValue = [];
				const reTx = res.data.replace(/\n/gi, '');
				const reTx1 = reTx.replace(/x/gi, ',');
				const reTx2 = reTx1.replace(/\//gi, ',');
				const spTx1 = reTx2.split(/%0A/g);

				spTx1.map((item, i) => {
					let x = item.substring(0, 1);
					if (x === '0') {
						mobValue.push(item);
					}
				});

				function findMissingNumbers(arr) {
					const missingNumbers = [];
					const maxGetal = Math.max(...arr.filter(Number.isFinite));
					const getallenSet = new Set(arr.filter(Number.isFinite));

					for (let i = 1; i <= maxGetal; i++) {
						let x = i;
						if (!getallenSet.has(i)) {
							mobValue.some((item, a) => {
								if (item.indexOf('id=') === -1) {
									mobValue[a] = item.slice(0, item.length) + `,id=${i}`;
									return i === x;
								}
							});
						}
					}
				}

				findMissingNumbers(idValue);
				let value = mobValue;
				value.map((valData, i) => {
					let calSplit = valData.slice(2).split(/,/g);
					let id = calSplit[calSplit.length - 1].replace(/id=/g, '');
					if (calSplit[0].substring(0, 5) === 'poly=') {
						const reTx = calSplit[0].replace(/poly=/gi, '');
						calSplit[0] = reTx;
						const arrPoly = [];

						for (let i = 0; i < calSplit.length - 3; i += 2) {
							if (!isNaN(parseInt(calSplit[i]))) {
								arrPoly.push({
									x: (parseInt(calSplit[i]) - offsetX) * offsetX1,
									y: parseInt((offsetY - calSplit[i + 1]) * offsetY1),
								});
							}
						}
						setObjectDetection((prevArray) => {
							const voorlaatsteIndex = prevArray.length - 1;
							return [
								...prevArray.slice(0, voorlaatsteIndex),
								{
									id: i + 1,
									selected: parseInt(id),
									polygon: arrPoly,
								},
								...prevArray.slice(voorlaatsteIndex),
							];
						});
					} else {
						setObjectDetection((prevArray) => {
							const voorlaatsteIndex = prevArray.length - 1;
							return [
								...prevArray.slice(0, voorlaatsteIndex),
								{
									id: i + 1,
									selected: parseInt(id),
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
								...prevArray.slice(voorlaatsteIndex),
							];
						});
					}
				});
			});
		}
	}, [props.imageLoading]);

	// Create dropdownlist from motion list
	const objectList = obj.map((data, i) => {
		return (
			<option key={i} value={i}>
				{data.name}
			</option>
		);
	});

	// Convert canvas html to camera
	const convert = (object) => {
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
	// Send objectdetection value to camera
	const apiSend = (sendObject) => {
		const list = [];

		obj.map((dat, a) => {
			if (dat.id !== 0) {
				const selectedOnes = objectDetection.filter(
					(item) => item.selected === dat.id
				);
				const idsOfSelectedOnes = selectedOnes.map((item) => item.id);
				list.push(idsOfSelectedOnes);
			}
		});

		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

		const promises = list.map(async (listItem, i) => {
			const item = obj.filter((item) => item.id === i + 1);
			await delay(1000); // Voeg een vertraging van 1 seconde (1000 milliseconden) toe
			return adminService.createVMListIma(
				props.cameraIp,
				item[0].key,
				listItem.join(','),
				console.log(listItem.join(','))
			);
		});

		Promise.all(promises)
			.then((results) => {
				console.log('Alle beloften zijn voltooid', results);
			})
			.catch((error) => {
				console.error('Fout bij het uitvoeren van beloften', error);
			});

		let sendData = '';
		if (sendObject.length === undefined) {
			sendData += `$noiseadjust=1%0A$postfilter=1%0A$limit=100%0A0,poly=${convert(
				sendObject
			)},s=0,a=5,id=${sendObject.id}`;
		} else {
			sendObject.map((data, i) => {
				if (data.id !== 0) {
					if (i === 0) {
						sendData += `$noiseadjust=1%0A$postfilter=1%0A$limit=100%0A0,poly=${convert(
							data
						)},a=5,am=90,s=0,id=${data.id}${
							sendObject.length - 2 !== i ? '%0A' : ''
						}`;
					} else {
						sendData += `0,poly=${convert(data)},a=5,am=90,s=0,id=${data.id}${
							sendObject.length - 2 !== i ? '%0A' : ''
						}`;
					}
				}
			});
		}
		adminService.createMotionLine(props.cameraIp, sendData);
	};

	// Make dropdown list
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
									<>
										<Button
											className="btn-warning"
											onClick={() => deleteObject(i)}
										>
											-
										</Button>
										<Button
											className="object-number"
											onClick={() => (refy.current = i + 1)}
										>
											{data.id}
										</Button>
									</>
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

	// Create canvas
	const handleSubmit = useCallback(
		(setPrivacy) => {
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
				if (isNaN(refy.current)) {
					refy.current = objList.current.length - 1;
				}

				if (objList.current.length > 1 && data[0] === 0) {
					if (
						objList.current[refy.current - 1] &&
						objList.current[refy.current - 1].polygon
					) {
						objList.current[refy.current - 1].polygon.push({
							x: _left,
							y: _top,
						});
					}
				}
			});

			canvas.on('mouse:up', (e) => {
				if (refy.current > 0) {
					canvas.clear();
					node();
				}
			});

			// Right button delete command
			fabric.util.addListener(
				document.getElementsByClassName('upper-canvas')[0],
				'contextmenu',
				function (e) {
					e.preventDefault();
					if (objList.current.length > 1 && e.button >= 0) {
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

			// Make polyline, polygon, text,...
			const node = () => {
				var txt;
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
							radius: b === 0 ? 10 : 5,
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

						if (b === 0) {
							txt = new fabric.Text(String(objList.current[a].id), {
								visible: visibility.current | false,
								fill: 'white',
								fontSize: 15,
								stroke: 'red',
								left: point.x,
								top: point.y,
								parentId: a,
								id: b,
								hasControls: false,
								selected: false,
								originX: 'center',
								originY: 'center',
							});

							var group = new fabric.Group([circle[b], txt], {
								left: point.x,
								top: point.y,
								parentId: a,
								id: b,
								hasControls: false,
								selected: false,
								originX: 'center',
								originY: 'center',
							});

							canvas.add(group);
						} else {
							canvas.add(circle[b]);
						}
					});
				});
			};
			node();
		},
		[refy.current]
	);

	// Change canvas layout
	useEffect(() => {
		handleSubmit();
	}, [objectDetection]);

	return <>{addObjectDetection()}</>;
});
