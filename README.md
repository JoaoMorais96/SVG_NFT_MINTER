# Simple NFT Factory
- You can change the NFT to whatever image of your liking. The image used is the logo of my [a crypto company](https://www.pyctor.com/). Just choose an image 
and turn it into an svg file.There are several websites where this can be done;
- You can change the password required to mint an employee NFT by changing it the **2_deploy:contracts.js** file. REMEMBER THAT IT IS NOT SAFE TO STORE PASSWORDS AS PRIVATE DATA IN ETHEREUM. PRIVATE DATA IS NOT REALLY PRIVATE!!!! THIS IS JUST FOR FUN
- Simply deploy the smart contract using truffle(or hardhat or whatever you use, but this code was written for truffle);
- In the terminal (within this directory) do: npm run dev;
- Try it out with a rinkeby account and see if you receive your NFT in [TestNet Opensea](https://testnets.opensea.io/)

### Work not done:
1. Password is clearly not safelly hidden. It is just a fun way to learn about EVM storage and security of "private data" within solidity;
2. It's an svg NFT and not IPFS

But it can't all be for free ;)
