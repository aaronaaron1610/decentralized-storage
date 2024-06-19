// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureFileStorage {
    struct File {
        string ipfsHash;
        string fileName;
        address owner;
        mapping(address => bool) permissions;
        address[] permittedUsers;
    }

    mapping(uint256 => File) public files;
    mapping(address => uint256[]) public userFiles;
    uint256 public fileCount;

    event FileUploaded(uint256 fileId, string fileName, string ipfsHash, address owner);
    event PermissionUpdated(uint256 fileId, address user, bool permission);
    event FileAccessed(uint256 fileId, address user);

    function uploadFile(string memory _ipfsHash, string memory _fileName) public {
        fileCount++;
        File storage file = files[fileCount];
        file.ipfsHash = _ipfsHash;
        file.fileName = _fileName;
        file.owner = msg.sender;
        file.permissions[msg.sender] = true;
        file.permittedUsers.push(msg.sender);

        userFiles[msg.sender].push(fileCount);

        emit FileUploaded(fileCount, _fileName, _ipfsHash, msg.sender);
    }

    function updatePermission(uint256 _fileId, address _user, bool _permission) public {
        require(files[_fileId].owner == msg.sender, "Not the owner");
        files[_fileId].permissions[_user] = _permission;

        if (_permission) {
            files[_fileId].permittedUsers.push(_user);
            userFiles[_user].push(_fileId);
        } else {
            // Remove user from permittedUsers array
            for (uint256 i = 0; i < files[_fileId].permittedUsers.length; i++) {
                if (files[_fileId].permittedUsers[i] == _user) {
                    files[_fileId].permittedUsers[i] = files[_fileId].permittedUsers[files[_fileId].permittedUsers.length - 1];
                    files[_fileId].permittedUsers.pop();
                    break;
                }
            }

            // Remove file from user's list
            for (uint256 i = 0; i < userFiles[_user].length; i++) {
                if (userFiles[_user][i] == _fileId) {
                    userFiles[_user][i] = userFiles[_user][userFiles[_user].length - 1];
                    userFiles[_user].pop();
                    break;
                }
            }
        }

        emit PermissionUpdated(_fileId, _user, _permission);
    }

    function accessFile(uint256 _fileId) public returns (string memory) {
        require(files[_fileId].permissions[msg.sender], "No permission");

        emit FileAccessed(_fileId, msg.sender);
        return files[_fileId].ipfsHash;
    }

    function getUserFiles(address _user) public view returns (uint256[] memory) {
        return userFiles[_user];
    }

    function getPermittedUsers(uint256 _fileId) public view returns (address[] memory) {
        return files[_fileId].permittedUsers;
    }
}
