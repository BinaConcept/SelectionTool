/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../molecules/button';
import { PolyFabric } from '../../javascript/polyFabric';
import axios from 'axios';

export const DetectionNavbar = (props) => {
	const ref = useRef();
	const [obj, setobj] = useState([]);

	const [objectDetection, setObjectDetection] = useState([
		{
			id: 0,
			selected: 0,
			polygon: [],
		},
	]);

	const createObject = (objData) => {
		const newItems = [
			{
				id: objectDetection.length + 1,
				selected: objData.selectedIndex,
				polygon: [],
			},
			...objectDetection,
		];
		newItems.sort((a, b) => (b.id !== 0 ? a.id - b.id : null));
		setObjectDetection(newItems);
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

	const apiCall = () => {
		const url =
			'http://192.168.0.11/control/control?read&section=event_ima&ima';

		const data = {
			username: 'admin',
			password: 'meinsm123',
		};
		axios
			.get(url, data)
			.then((response) => {
				const txt = response.data;
				const reTx = txt.replace(/:/g, ' ');
				const spTx1 = reTx.split('ima=');

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
	};

	useEffect(() => {
		apiCall();
	}, []);

	const deleteObject = (index) => {
		setObjectDetection(objectDetection.filter((item, i) => i !== index));
	};

	const objectList = obj.map((data, i) => {
		return (
			<option key={i} value={i}>
				{data.name}
			</option>
		);
	});

	const addObjectDetection = () => {
		const obDetect = () =>
			objectDetection.map((data, i) => (
				<div className="row" key={i}>
					<div className="col-lg-6">
						<div className="input-group mb-3">
							{objectDetection.length !== i + 1 ? (
								<Button className="btn-warning" onClick={() => deleteObject(i)}>
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
							>
								{objectList}
							</select>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-6"></div>
					</div>
				</div>
			));
		return obDetect();
	};
	return (
		<>
			{addObjectDetection()}
			<button onClick={() => ref.current.log()}>Click</button>
			<PolyFabric ref={ref}></PolyFabric>
		</>
	);
};
