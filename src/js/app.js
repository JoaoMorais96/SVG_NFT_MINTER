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

  createNFT: async function () {

    // Connect Moralis to server
    Moralis.initialize("jrU3irZAahs5sFfSC3b0KOxCS2PthYGLX1B7EZrI");
    Moralis.serverURL = "https://kgjyxei95ex5.usemoralis.com:2053/server";

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

  mintEmployeeNFT: function () {
    // retrieve the detail of the article
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
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
