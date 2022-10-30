const { except, expect } = require('chai');
const { BigNumber } = require('ethers');
const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');

describe('Attack', () => {
    it('Should empty the balance of the GoodContract', async function () {
        // Deploying the GoodContract
        const goodContractFactory = await ethers.getContractFactory(
            'GoodContract'
        );
        const goodContract = await goodContractFactory.deploy();
        await goodContract.deployed();

        // Deploying the BadContract
        const badContractFactory = await ethers.getContractFactory(
            'BadContract'
        );
        const badContract = await badContractFactory.deploy(
            goodContract.address
        );
        await badContract.deployed();

        //
        const [_, innocentAddress, attackerAddress] = await ethers.getSigners();

        console.log(innocentAddress);
        console.log(attackerAddress);

        console.log('Nice');
        console.log(goodContract.address);

        let tx = await goodContract.connect(innocentAddress).addBalance({
            value: parseEther('10'),
        });
        await tx.wait();

        let balanceEth = await ethers.provider.getBalance(goodContract.address);
        expect(balanceEth).to.equal(parseEther('10'));
        console.log('Nice');

        tx = await badContract.connect(attackerAddress).attack({
            value: parseEther('3'),
        });
        console.log('Nice');

        await tx.wait();

        balanceEth = await ethers.provider.getBalance(goodContract.address);
        console.log(balanceEth);
        expect(balanceEth).to.equal(parseEther('1'));

        balanceEth = await ethers.provider.getBalance(badContract.address);
        console.log(balanceEth);
        expect(balanceEth).to.equal(parseEther('12'));
    });
});
