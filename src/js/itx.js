require('dotenv').config();
//Setup the ITX provider
const itx = new ethers.providers.InfuraProvider(
  'rinkeby', // or 'ropsten', 'rinkeby', 'kovan', 'goerli'
  process.env.YOUR_INFURA_PROJECT_ID
)

//Create a signer account
const signer = new ethers.Wallet(process.env.ACCOUNT_1_PASSWORD, itx)

//Check your ITX gas tank
async function getBalance() {
    response = await itx.send('relay_getBalance', [signer.address])
    console.log(`Your current ITX balance is ${response.balance}`)
  }

  //Make a deposit
  async function deposit(signer, eth_to_deposit) {
    const tx = await signer.sendTransaction({
      // ITX deposit contract (same address for all public Ethereum networks)
      to: '0x015C7C7A7D65bbdb117C573007219107BD7486f9',
      // Choose how much ether you want to deposit to your ITX gas tank
      value: ethers.utils.parseUnits(eth_to_deposit, 'ether')
    })
    // Waiting for the transaction to be mined
    await tx.wait()
  }

//Signing a relay request
  async function signRequest(tx) {
    const relayTransactionHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'bytes', 'uint', 'uint', 'string'],
        [tx.to, tx.data, tx.gas, 4, tx.schedule] // Rinkeby chainId is 4
      )
    )
    return await signer.signMessage(ethers.utils.arrayify(relayTransactionHash))
  }

//Sending your first transaction
  async function callContract() {
    const iface = new ethers.utils.Interface(['function echo(string message)'])
    const data = iface.encodeFunctionData('echo', ['Hello world!'])
    const tx = {
      to: '0x6663184b3521bF1896Ba6e1E776AB94c317204B6',
      data: data,
      gas: '100000',
      schedule: 'fast'
    }
    const signature = await signRequest(tx)
    const relayTransactionHash = await itx.send('relay_sendTransaction', [tx, signature])
    console.log(`ITX relay hash: ${relayTransactionHash}`)
    return relayTransactionHash
  }

  const wait = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
  
  //Check if relay request is mined
  async function waitTransaction(relayTransactionHash) {
    let mined = false
  
    while (!mined) {
      const statusResponse = await itx.send('relay_getTransactionStatus', [relayTransactionHash])
  
      if (statusResponse.broadcasts) {
        for (let i = 0; i < statusResponse.broadcasts.length; i++) {
          const bc = statusResponse.broadcasts[i]
          const receipt = await itx.getTransactionReceipt(bc.ethTxHash)
          if (receipt && receipt.confirmations && receipt.confirmations > 1) {
            mined = true
            return receipt
          }
        }
      }
      await wait(1000)
    }
  }