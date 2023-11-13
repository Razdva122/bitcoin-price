import React, { FC, useState } from 'react';
import { Button, Input, Select } from 'antd';
import './style.css';
import { IAppData, TPriceType } from '../../interface';

export const Header: FC<{
	portfolios: IAppData, 
	selectedPortfolio: string | undefined,
	priceType: TPriceType,
	addPortfolio: (key: string) => void,
	setSelectedPortfolio: (key: string) => void,
	setPriceType: (type: TPriceType) => void
}> = ({portfolios, selectedPortfolio, priceType, addPortfolio, setSelectedPortfolio, setPriceType}) => {
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

	const priceSelect = <Select 
		style={{ width: '30%' }} 
		placeholder="Select pricetype" 
		value={priceType}
		onChange={name => setPriceType(name)}
	>
		<Select.Option value={'total'} key={'total'}>{'total'}</Select.Option>
		<Select.Option value={'diff'} key={'diff'}>{'diff'}</Select.Option>
	</Select>

	function createPortfolio() {
		addPortfolio(portfolioName);
		setPortfolioName("");
	}

	return (
    <div className="header">
			{selectPortfolio}
			{priceSelect}
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
