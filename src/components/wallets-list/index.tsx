import { Button, Input } from 'antd';
import React, { FC, useState } from 'react';
import { IPortfolioState } from '../../interface';

import { Price } from '../price';

import './style.css';

export const WalletsList: FC<{
	addWallet: (key: string) => void,
	wallets: IPortfolioState['wallets'];
}> = ({addWallet, wallets}) => {
	const [walletAdress, setWalletAdress] = useState("");

	return (
		<div className='wallets-list'>
			<div className="new-portfolio-container">
				<Input.Group compact>
					<Input
						style={{ width: 'calc(100% - 130px)' }} 
						placeholder="Wallet id" 
						value={walletAdress}
						onChange={e => setWalletAdress(e.target.value)}
					/>
					<Button type="primary" onClick={() => {
						addWallet(walletAdress);
						setWalletAdress("");
					}}>Add wallet</Button>
				</Input.Group>
			</div>
			<div className='wallets-container'>
				{Object.entries(wallets).sort(
					([_keyA, valA], [_keyB, valB]) => Number(new Date(valB.transactions[0]?.date || "")) - Number(new Date(valA.transactions[0]?.date || ""))
				).map(([wallet, {transactions}]) => (
					<div className='wallet-item' key={wallet}>
						<div className='wallet-address' key={wallet}>{wallet}</div>
						<div className='wallet-transactions'>
							{transactions.map((el, index) => (
								<Price price={el.price} key={wallet + index}></Price>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
