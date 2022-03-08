App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // initialize web3
    if (typeof web3 !== "undefined") {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = Web3.providers.HttpProvider("http://localhost:7545");
    }

    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function (err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function () {
    $.getJSON("EmployeeToken.json", function (employeeTokenArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.EmployeeToken = TruffleContract(employeeTokenArtifact);
      // set the provider for our contracts
      App.contracts.EmployeeToken.setProvider(App.web3Provider);
      // retrieve the article from the contract
      return 0;
    });
  },

  //Gets the passwor. Can only be called by the initial contract sender address
  getPassword: function () {
    App.contracts.EmployeeToken.deployed()
      .then(async function (instance) {
        console.log(await instance.getPassword({
          from: App.account}));
      })
      .then(function (result) {})
      .catch(function (err) {
        console.error(err);
      });
  },

  //Gets the current image of the NFT (svg link)
  getTokenURI: function () {
    App.contracts.EmployeeToken.deployed()
      .then(async function (instance) {
        console.log(await instance.getCurrentTokenURI());
      })
      .then(function (result) {})
      .catch(function (err) {
        console.error(err);
      });
  },

    //Changes the current image to be minted as an NFT (svg link)
    changeTokenURI: function () {
      let _new_svg = $("#newTokenURI").val();
      
      App.contracts.EmployeeToken.deployed()
        .then(async function (instance) {
          console.log(await instance.changeTokenUri(_new_svg, {
            from: App.account,
            gas: 5000000,
          }));
        })
        .then(function (result) {})
        .catch(function (err) {
          console.error(err);
        });
    },

  //Mints and sends the NFT to the msg.sender
  mintEmployeeNFT: function () {
    // retrieve the details
    let _contract_password = $("#contract_password").val();
    var _employee_id = $("#employee_id").val();

    if (_employee_id.trim() == "" ||_contract_password.trim() == "") {
      // nothing to sell
      return false;
    }

    App.contracts.EmployeeToken.deployed()
      .then(async function (instance) {
        return instance.createEmployeeNFT(_contract_password, _employee_id, {
          from: App.account,
          gas: 5000000,
        });
      })
      .then(function (result) {})
      .catch(function (err) {
        console.error(err);
      });
  },

  /////////////////////////////Deposit money to contract. Possible future use in English auction/////////////
  depositMoneyToContract: function () {
    App.contracts.EmployeeToken.deployed()
    .then(async function (instance) {
      return instance.deposit({
        from: App.account,
        value: Number("50000000000000000"),//<amount-in-Wei> 0.5eth=50000000000000000wei
       });
    })
    .then(function (result) {})
    .catch(function (err) {
      console.error(err);
    });
  },
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////IPFS(still to be added)/////////////////////////////////////////////
  createNFT: async function () {
    require(dotenv).config();
    // Connect Moralis to server
    Moralis.initialize(process.env.MORALIS_KEY);
    Moralis.serverURL = process.env.MORALIS_SERVER;

    //Upload an image
    uploadImage =  async () => {

      let _NFT_graphics = $("#NFT-graphics").get(0);
      const data = _NFT_graphics.files[0];
      const file = new Moralis.File(data.name, data);
  
      await file.saveIPFS();
      console.log("Without metadata: \n"+"Link to saved image: " + file.ipfs() + '\n' + "Hash to saved image: " + file.hash())
      return file.ipfs();
    }

    // Upload metadata object
    uploadMetadata = async (imageURL) => {
      const name = document.getElementById('nameID').value;
      const description = document.getElementById('description').value;
  
      const metadata = {
        "name" : name,
        "description": description,
        "image": imageURL
      }
  
      const fileData = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(metadata))});
      await fileData.saveIPFS();
      console.log("With metadata: \n"+"Link to saved image: " + fileData.ipfs() + '\n' + "Hash to saved image: " + fileData.hash())
    }

    //Login function
     await Moralis.Web3.authenticate().then(function (user) {
        console.log('Logged in')
        console.log(user)
      }).then(async function () {
        //Upload image and then the corresponding metadata
        const imageUploaded = await uploadImage();
        await uploadMetadata(imageUploaded);
      })
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////GAS TANK is added but no payed minting implementation///////////////////////////
  depositToGasTank: async function() {
    // retrieve the eth amount to be deposit
    let _eth_to_deposit = $("#eth_to_deposit").val();
    deposit(signer,_eth_to_deposit)
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
