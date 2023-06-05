import React, { FC, useState } from 'react';
import { Button, Input, Select } from 'antd';
import './style.css';
import { IAppData } from '../../interface';

export const Header: FC<{
	portfolios: IAppData, 
	selectedPortfolio: string | undefined, 
	addPortfolio: (key: string) => void,
	setSelectedPortfolio: (key: string) => void
}> = ({portfolios, selectedPortfolio, addPortfolio, setSelectedPortfolio}) => {
	const [portfolioName, setPortfolioName] = useState("");

	let selectPortfolio;

	if (Object.keys(portfolios).length) {
		selectPortfolio = <Select 
			style={{ width: '30%' }} 
			placeholder="Select portfolio" 
			value={selectedPortfolio}
			onChange={name => setSelectedPortfolio(name)}
		>
			{Object.keys(portfolios).map((name) => (
				<Select.Option value={name} key={name}>{name}</Select.Option>
			))}
		</Select>;
	}

	function createPortfolio() {
		addPortfolio(portfolioName);
		setPortfolioName("");
	}

	return (
    <div className="header">
			{selectPortfolio}
			<div className="new-portfolio-container">
				<Input.Group compact>
					<Input
						style={{ width: 'calc(100% - 130px)' }} 
						placeholder="Name of portfolio" 
						value={portfolioName} 
						onChange={e => setPortfolioName(e.target.value)}
					/>
					<Button type="primary" onClick={() => createPortfolio()}>Create portfolio</Button>
				</Input.Group>
			</div>
    </div>
  );
}
