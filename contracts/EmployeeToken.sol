// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "base64-sol/base64.sol";

contract EmployeeToken is Ownable, ERC721URIStorage {
    //State variables
    uint256 public employeeCounter;
    string private password;
    string public tokenURIStr;

    //Events
    event CreatedEmployeeNFT(uint256 indexed employeeId, string tokenURI);

    //Regular constructor
    constructor(string memory _password)
        ERC721("Pyctor Employee NFT", "PYENFT")
        Ownable()
    {
        employeeCounter = 0;
        password = _password;
        tokenURIStr = formatTokenURI(
            svgToImageURI(
                '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="511.000000pt" height="512.000000pt" viewBox="0 0 511.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M0 2560 l0 -2560 2555 0 2555 0 0 2560 0 2560 -2555 0 -2555 0 0 -2560z m2806 2217 c104 -38 181 -110 233 -217 31 -65 36 -86 39 -162 4 -95 -11 -158 -55 -236 -35 -60 -115 -135 -173 -162 l-50 -23 0 -127 0 -127 83 -17 c341 -72 630 -287 785 -584 96 -184 136 -347 136 -552 -1 -184 -36 -334 -115 -493 -77 -154 -202 -305 -338 -408 -138 -103 -332 -184 -503 -209 -137 -20 -377 -3 -498 35 -14 5 -26 -16 -67 -117 l-49 -123 38 -33 c50 -45 107 -134 135 -210 99 -271 -58 -586 -336 -672 -81 -26 -210 -28 -295 -5 -196 52 -348 227 -378 435 -23 155 33 321 147 435 100 100 230 155 366 155 l67 0 46 112 c25 62 47 118 48 124 2 7 -31 34 -72 62 -162 107 -283 246 -370 426 -146 299 -157 654 -30 958 93 225 313 455 545 571 72 36 225 85 306 98 l69 12 0 126 0 126 -52 25 c-153 72 -256 267 -229 437 42 270 313 432 567 340z"/><path d="M2590 4511 c-104 -55 -107 -199 -4 -259 123 -72 267 62 205 191 -37 77 -127 108 -201 68z"/><path d="M2540 3410 c-406 -65 -694 -410 -692 -830 1 -141 23 -237 86 -365 102 -207 286 -362 511 -431 82 -25 104 -28 245 -28 147 0 159 1 242 30 346 122 566 461 545 839 -7 118 -27 203 -72 301 -108 237 -322 415 -562 468 -91 20 -231 28 -303 16z"/><path d="M1870 1079 c-65 -13 -130 -57 -164 -113 -82 -132 -17 -310 132 -360 57 -20 85 -20 150 -1 102 31 172 126 172 236 0 150 -140 266 -290 238z"/></g></svg>'
            )
        );
    }

    //Defines a password to make sure only employees can mint nfts
    modifier passRequired(string memory _pass) {
        require(
            keccak256(abi.encodePacked(_pass)) ==
                keccak256(abi.encodePacked(password))
        );
        _;
    }

    //Deposit eth into this contract. Msg.data must be empty
    receive() external payable {}

    //Fallback is called when msg.data is not empty
    fallback() external payable {}

    //Get this contract balance to see if it needs to be funded (since it will pay NFT minting)
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //Changes the token URI when provided with a new svg file
    function changeTokenUri(string memory _newSvg) public onlyOwner {
        tokenURIStr = formatTokenURI(svgToImageURI(_newSvg));
    }

    //The owner can see the password
    function getPassword() public view onlyOwner returns (string memory) {
        return password;
    }

    //See how many employees exit aka how many tokens where minted
    function getNumberOfEmployees() public view returns (uint256) {
        return employeeCounter;
    }

    //See the current tokenURI
    function getCurrentTokenURI() public view returns (string memory) {
        return tokenURIStr;
    }

    //Create the NFT for the employee
    function createEmployeeNFT(string memory _pass, uint256 _employeeID)
        public
        passRequired(_pass)
    {
        employeeCounter++;

        _safeMint(msg.sender, _employeeID);

        _setTokenURI(_employeeID, tokenURIStr);

        emit CreatedEmployeeNFT(_employeeID, tokenURIStr);
    }

    // Trasnform an SVG to an image URI
    function svgToImageURI(string memory _svg)
        public
        pure
        returns (string memory)
    {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(_svg)))
        );
        string memory imageURI = string(
            abi.encodePacked(baseURL, svgBase64Encoded)
        );

        return imageURI;
    }

    // Transform an image URI to a token URI
    function formatTokenURI(string memory _imageURI)
        public
        pure
        returns (string memory)
    {
        string memory baseURL = "data:application/json;base64,";
        return
            string(
                abi.encodePacked(
                    baseURL,
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "Pyctor Employee NFT",',
                                '"description": "An NFT to mark the entry of a new Pyctor employee",',
                                '"attributes": "",',
                                '"image":"',
                                _imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
