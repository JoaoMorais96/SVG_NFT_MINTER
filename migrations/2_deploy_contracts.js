const EmployeeToken = artifacts.require("./EmployeeToken.sol");

module.exports = function (deployer) {
  let password = "Unicorn";
  deployer.deploy(EmployeeToken, password);
};