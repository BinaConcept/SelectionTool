import './App.css';
//import { fabric } from 'fabric';
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './atomic/molecules/button';
import { EyesIcone } from './atomic/atoms/eyesIcone';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { DetectionNavbar } from './atomic/organisms/detectionNavbar';

import { PolyFabric } from './layout/main/polyFabric';
function App(props, { removeObject }) {
	const [ip, setIp] = useState('0.0.0.0');
	const [loaded, setLoaded] = useState(false);

	const childRef = useRef();
	const camera = () => {
		return (
			<>
				<div id="camera">
					<Button
						id="eyes"
						className="btn-secondary p-2"
						onClick={() => childRef.current.enableDisable()}
						disabled={!loaded}
					>
						<EyesIcone
							className="ml-5"
							width={30}
							height={30}
							fill={'black'}
						></EyesIcone>
					</Button>

					{/* <Button id="remove" className="btn-secondary p-2">
						<DeleteIcone width={30} height={30} fill={'black'}></DeleteIcone>
					</Button> */}

					<img
						className="view"
						// src={
						// 	'http://' +
						// 	ip +
						// 	'/control/faststream.jpg?stream=full&quality=40&fps=4.0'
						// }
						src={require('../src/dataset/test_data/room1.jpg')}
						alt=""
						onLoad={() => setLoaded(true)}
						onError={() => setLoaded(false)}
					/>

					<canvas id="c"></canvas>
				</div>
				<button
					type="button"
					className="btn btn-warning w-100 mt-4 mb-2"
					onClick={() => childRef.current.store()}
					disabled={!loaded}
				>
					STORE
				</button>
			</>
		);
	};

	return (
		<div className="container mt-5">
			<div className="row">
				<div className="col-lg-7">
					<div className="ip-input">
						{/* input ip adress */}
						<div className="input-group mb-3">
							<span className="input-group-text" id="basic-addon1">
								IP
							</span>
							<input
								type="text"
								className="form-control"
								placeholder="x.x.x.x"
								aria-label="Ip"
								aria-describedby="basic-addon1"
								onChange={(e) => setIp(e.target.value)}
							/>
						</div>
					</div>
					{camera()}
					{/* {ip ? camera() : null} */}
				</div>

				<div className="col-lg-5">
					<ToastContainer />
					<PolyFabric
						ref={childRef}
						cameraIp={ip}
						imageLoading={loaded}
					></PolyFabric>
				</div>
			</div>
		</div>
	);
}

export default App;
