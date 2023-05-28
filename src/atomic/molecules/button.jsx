import React from 'react';

export const Button = (props) => {
	const defaultClassName = ' btn ';
	const setClassName = props.className
		? defaultClassName + props.className
		: defaultClassName;

	return (
		<button
			type="button"
			onClick={props.onClick}
			id={props.id}
			className={setClassName}
			disabled={props.disabled}
		>
			{props.children}
		</button>
	);
};
