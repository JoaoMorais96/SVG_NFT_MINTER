const EmployeeToken = artifacts.require("./EmployeeToken.sol");

module.exports = function (deployer) {
  let password = "pyctorUnicorn";
  deployer.deploy(EmployeeToken, password);
};